import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, PanResponder, Animated, Dimensions, Alert } from 'react-native';
import { RefreshCw, Check, X, Plus, Shuffle, Repeat, ArrowRightLeft, Trash2, Save, Wand2, ArrowRight, BarChart3, Flame, Trophy, Calendar, Camera, Link as LinkIcon, Type as TypeIcon, Image as ImageIcon, Loader2, Edit2, ChevronLeft, LayoutGrid, MoreVertical, Layers } from 'lucide-react-native';
import { Flashcard, Deck, UserStats } from '../types';
import { preprocessMath } from '../utils/math';
import { generateFlashcards } from '../services/geminiService';
import { getStats, updateStats, saveDeck, getDecks, deleteDeck } from '../services/storage';
import Markdown from 'react-native-markdown-display';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

type StudyMode = 'standard' | 'shuffle' | 'spaced';
type ViewMode = 'study' | 'library' | 'manage';
type GenSource = 'topic' | 'image' | 'youtube';

interface FlashcardsProps {
  onBack?: () => void;
}

export const Flashcards: React.FC<FlashcardsProps> = ({ onBack }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('library');
  
  // Generation State
  const [genSource, setGenSource] = useState<GenSource>('topic');
  const [topic, setTopic] = useState('');
  const [ytLink, setYtLink] = useState('');
  
  // Study/Manage State
  const [currentDeck, setCurrentDeck] = useState<Deck | null>(null);
  const [reviewQueue, setReviewQueue] = useState<Flashcard[]>([]);
  const [studyMode, setStudyMode] = useState<StudyMode>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studySessionComplete, setStudySessionComplete] = useState(false);
  
  // Editing State
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  // Stats/Library State
  const [stats, setStats] = useState<UserStats | null>(null);
  const [savedDecks, setSavedDecks] = useState<Deck[]>([]);

  // Swipe Animation
  const pan = useRef(new Animated.ValueXY()).current;

  useEffect(() => {
    const loadData = async () => {
      setStats(await getStats());
      setSavedDecks(await getDecks());
    };
    loadData();
  }, []);

  const initializeSession = (deck: Deck, mode: StudyMode) => {
    setCurrentDeck(deck);
    let queue = [...deck.cards];
    if (mode === 'shuffle') {
      queue.sort(() => Math.random() - 0.5);
    } else if (mode === 'spaced') {
       queue.sort((a, b) => (a.mastered === b.mastered ? 0 : a.mastered ? 1 : -1));
    }
    setReviewQueue(queue);
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudySessionComplete(false);
    setViewMode('study');
    pan.setValue({ x: 0, y: 0 });
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    let payload = '';
    if (genSource === 'topic') { if (!topic.trim()) return; payload = topic; }
    else if (genSource === 'youtube') { if (!ytLink.trim()) return; payload = ytLink; }

    setIsGenerating(true);
    try {
      const newCards = await generateFlashcards(genSource, payload, '');
      if (newCards.length > 0) {
        const deckTitle = genSource === 'topic' ? topic : 'Video Summary';
        const newDeck: Deck = {
            id: Math.random().toString(36).substr(2, 9),
            title: deckTitle,
            cards: newCards,
            createdAt: Date.now(),
            lastStudied: Date.now(),
            masteryPercentage: 0
        };
        await saveDeck(newDeck);
        setSavedDecks(await getDecks());
        initializeSession(newDeck, studyMode);
      }
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  const handleNext = async (known: boolean) => {
    const newStats = await updateStats(known);
    setStats(newStats);

    if (currentDeck && reviewQueue[currentIndex]) {
        const currentCardId = reviewQueue[currentIndex].id;
        const updatedCards = currentDeck.cards.map(c => 
            c.id === currentCardId ? { ...c, mastered: known } : c
        );
        const updatedDeck = { ...currentDeck, cards: updatedCards };
        setCurrentDeck(updatedDeck);
        await saveDeck(updatedDeck);
        setSavedDecks(await getDecks());
    }

    const currentCardLocal = reviewQueue[currentIndex];
    let shouldRequeue = studyMode === 'spaced' && !known;
    const isLastCard = currentIndex === reviewQueue.length - 1;

    if (isLastCard && !shouldRequeue) {
      setStudySessionComplete(true);
      return;
    }

    if (shouldRequeue) setReviewQueue(prev => [...prev, currentCardLocal]);
    setIsFlipped(false);
    setCurrentIndex(prev => prev + 1);
    pan.setValue({ x: 0, y: 0 });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          Animated.timing(pan, {
            toValue: { x: SCREEN_WIDTH + 100, y: gesture.dy },
            duration: 200,
            useNativeDriver: false,
          }).start(() => handleNext(true));
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          Animated.timing(pan, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gesture.dy },
            duration: 200,
            useNativeDriver: false,
          }).start(() => handleNext(false));
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD / 2],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD / 2, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const currentCard = reviewQueue[currentIndex];

  const handleDeleteCard = async (cardId: string) => {
    if (!currentDeck) return;
    
    Alert.alert(
      "Delete Card",
      "Are you sure you want to delete this card?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            const updatedDeck = {
              ...currentDeck,
              cards: currentDeck.cards.filter(c => c.id !== cardId)
            };
            await saveDeck(updatedDeck);
            setCurrentDeck(updatedDeck);
            setSavedDecks(await getDecks());
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Flashcards</Text>
      </View>
      
      {/* Navigation Tabs */}
      <View style={styles.tabs}>
          <TouchableOpacity 
            onPress={() => setViewMode('library')}
            style={[styles.tab, viewMode === 'library' && styles.activeTab]}
          >
              <LayoutGrid size={14} color={viewMode === 'library' ? 'white' : '#94a3b8'} />
              <Text style={[styles.tabText, viewMode === 'library' && styles.activeTabText]}>Library</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { if(currentDeck) setViewMode('study'); else setViewMode('library'); }}
            disabled={!currentDeck && viewMode !== 'study'}
            style={[styles.tab, viewMode === 'study' && styles.activeTab, !currentDeck && styles.disabledTab]}
          >
              <RefreshCw size={14} color={viewMode === 'study' ? 'white' : '#94a3b8'} />
              <Text style={[styles.tabText, viewMode === 'study' && styles.activeTabText]}>Study</Text>
          </TouchableOpacity>
      </View>

      {viewMode === 'library' && (
        <ScrollView style={styles.libraryScroll} showsVerticalScrollIndicator={false}>
           {/* Generator UI */}
           <View style={styles.generatorCard}>
                <View style={styles.genTabs}>
                    <TouchableOpacity onPress={() => setGenSource('topic')} style={[styles.genTab, genSource === 'topic' && styles.activeGenTab]}>
                      <Text style={[styles.genTabText, genSource === 'topic' && { color: '#22d3ee' }]}>TOPIC</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setGenSource('youtube')} style={[styles.genTab, genSource === 'youtube' && styles.activeGenTab]}>
                      <Text style={[styles.genTabText, genSource === 'youtube' && { color: '#ef4444' }]}>VIDEO</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.genInputRow}>
                    <View style={styles.genInputWrapper}>
                        {genSource === 'topic' && (
                          <TextInput 
                            value={topic} 
                            onChangeText={setTopic} 
                            placeholder="Enter topic..." 
                            placeholderTextColor="#475569"
                            style={styles.genInput} 
                          />
                        )}
                        {genSource === 'youtube' && (
                          <TextInput 
                            value={ytLink} 
                            onChangeText={setYtLink} 
                            placeholder="YouTube URL..." 
                            placeholderTextColor="#475569"
                            style={styles.genInput} 
                          />
                        )}
                    </View>
                    <TouchableOpacity onPress={handleGenerate} disabled={isGenerating} style={styles.genButton}>
                        {isGenerating ? <ActivityIndicator size="small" color="white" /> : <Wand2 size={20} color="white" />}
                    </TouchableOpacity>
                </View>
           </View>

           {/* Deck List */}
           <View style={styles.deckList}>
              <Text style={styles.sectionTitle}>SUBJECT VAULT</Text>
              {savedDecks.length === 0 ? (
                <View style={styles.emptyState}>
                  <Layers size={48} color="#475569" />
                  <Text style={styles.emptyText}>No decks found</Text>
                </View>
              ) : (
                savedDecks.map(deck => (
                  <TouchableOpacity 
                    key={deck.id} 
                    onPress={() => initializeSession(deck, studyMode)}
                    style={styles.deckCard}
                  >
                    <View style={styles.deckHeader}>
                      <View style={styles.deckInfo}>
                        <Text style={styles.deckTitle}>{deck.title}</Text>
                        <Text style={styles.deckMeta}>{deck.cards.length} Cards • {new Date(deck.lastStudied).toLocaleDateString()}</Text>
                      </View>
                      <View style={styles.deckActions}>
                        <TouchableOpacity onPress={() => { setCurrentDeck(deck); setViewMode('manage'); }} style={styles.deckActionBtn}>
                          <Layers size={16} color="#94a3b8" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteDeck(deck.id).then(setSavedDecks)} style={styles.deckActionBtn}>
                          <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <View style={styles.masteryContainer}>
                      <View style={styles.masteryBar}>
                        <View style={[styles.masteryFill, { width: `${deck.masteryPercentage}%` }]} />
                      </View>
                      <Text style={styles.masteryText}>{deck.masteryPercentage}%</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
           </View>
        </ScrollView>
      )}

      {viewMode === 'study' && (
        <View style={styles.studyContainer}>
           {/* Study Controls */}
           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modeScroll}>
              <TouchableOpacity onPress={()=>setStudyMode('standard')} style={[styles.modeBtn, studyMode === 'standard' && styles.activeModeBtn]}>
                <ArrowRightLeft size={14} color={studyMode === 'standard' ? 'white' : '#64748b'} />
                <Text style={[styles.modeBtnText, studyMode === 'standard' && styles.activeModeBtnText]}>LINEAR</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>setStudyMode('shuffle')} style={[styles.modeBtn, studyMode === 'shuffle' && styles.activeModeBtn]}>
                <Shuffle size={14} color={studyMode === 'shuffle' ? 'white' : '#64748b'} />
                <Text style={[styles.modeBtnText, studyMode === 'shuffle' && styles.activeModeBtnText]}>RANDOM</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>setStudyMode('spaced')} style={[styles.modeBtn, studyMode === 'spaced' && styles.activeModeBtn]}>
                <Repeat size={14} color={studyMode === 'spaced' ? 'white' : '#64748b'} />
                <Text style={[styles.modeBtnText, studyMode === 'spaced' && styles.activeModeBtnText]}>SPACED</Text>
              </TouchableOpacity>
           </ScrollView>

           {studySessionComplete ? (
              <View style={styles.completeCard}>
                <View style={styles.trophyWrapper}><Trophy size={40} color="#10b981" /></View>
                <Text style={styles.completeTitle}>Session Complete!</Text>
                <Text style={styles.completeDesc}>You've mastered this set. Ready for another round or a new subject?</Text>
                <TouchableOpacity onPress={()=>initializeSession(currentDeck!, studyMode)} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>Review Again</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setViewMode('library')} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>Return to Library</Text>
                </TouchableOpacity>
              </View>
           ) : currentCard && (
              <View style={styles.cardContainer}>
                <Animated.View 
                  style={[
                    styles.swipeCard,
                    { transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }] }
                  ]}
                  {...panResponder.panHandlers}
                >
                    <TouchableOpacity 
                      activeOpacity={1}
                      onPress={() => setIsFlipped(!isFlipped)}
                      style={styles.cardInner}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardBadge}>{isFlipped ? 'INSIGHT' : 'CONCEPT'}</Text>
                            <Text style={styles.cardCounter}>{currentIndex + 1} / {reviewQueue.length}</Text>
                        </View>
                        
                        <ScrollView style={styles.cardContent} contentContainerStyle={styles.cardContentInner}>
                            <Markdown style={markdownStyles}>
                                {preprocessMath(isFlipped ? currentCard.back : currentCard.front)}
                            </Markdown>
                        </ScrollView>

                        <Text style={styles.cardFooter}>Tap to flip • Swipe to mark</Text>

                        {/* Swipe Indicators */}
                        <Animated.View style={[styles.swipeIndicator, styles.likeIndicator, { opacity: likeOpacity }]}>
                            <Check size={48} color="white" strokeWidth={4} />
                        </Animated.View>
                        <Animated.View style={[styles.swipeIndicator, styles.nopeIndicator, { opacity: nopeOpacity }]}>
                            <X size={48} color="white" strokeWidth={4} />
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>
              </View>
           )}
        </View>
      )}

      {/* Simplified Manage View */}
      {viewMode === 'manage' && currentDeck && (
        <View style={styles.manageContainer}>
          <View style={styles.manageHeader}>
            <TouchableOpacity onPress={()=>setViewMode('library')} style={styles.manageBackBtn}><ChevronLeft size={24} color="#94a3b8" /></TouchableOpacity>
            <View style={styles.manageHeaderText}>
              <Text style={styles.manageTitle}>{currentDeck.title}</Text>
              <Text style={styles.manageSubtitle}>Managing {currentDeck.cards.length} Cards</Text>
            </View>
          </View>

          <ScrollView style={styles.cardList} showsVerticalScrollIndicator={false}>
            {currentDeck.cards.map(card => (
              <View key={card.id} style={styles.cardItem}>
                <View style={styles.cardItemInfo}>
                  <Text style={styles.cardItemFront} numberOfLines={2}>{card.front}</Text>
                  <Text style={styles.cardItemBack} numberOfLines={2}>{card.back}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteCard(card.id)} style={styles.cardItemDelete}>
                  <Trash2 size={14} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1221',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#0b1221',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    padding: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#0891b2',
  },
  disabledTab: {
    opacity: 0.3,
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginLeft: 8,
  },
  activeTabText: {
    color: 'white',
  },
  libraryScroll: {
    flex: 1,
    paddingHorizontal: 4,
  },
  generatorCard: {
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  genTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  genTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeGenTab: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  genTabText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 1,
  },
  genInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  genInputWrapper: {
    flex: 1,
  },
  genInput: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  genButton: {
    width: 48,
    height: 48,
    backgroundColor: '#0891b2',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckList: {
    marginBottom: 100,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 2,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  emptyState: {
    padding: 48,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    alignItems: 'center',
    opacity: 0.4,
  },
  emptyText: {
    color: '#94a3b8',
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  deckCard: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 28,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  deckInfo: {
    flex: 1,
  },
  deckTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f1f5f9',
    marginBottom: 4,
  },
  deckMeta: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  deckActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deckActionBtn: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  masteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  masteryBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  masteryFill: {
    height: '100%',
    backgroundColor: '#22d3ee',
  },
  masteryText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#22d3ee',
  },
  studyContainer: {
    flex: 1,
  },
  modeScroll: {
    flexGrow: 0,
    marginBottom: 24,
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 8,
  },
  activeModeBtn: {
    backgroundColor: '#0891b2',
  },
  modeBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    marginLeft: 8,
    letterSpacing: 1,
  },
  activeModeBtnText: {
    color: 'white',
  },
  completeCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 40,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  trophyWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  completeDesc: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#0891b2',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  secondaryBtn: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeCard: {
    width: '100%',
    aspectRatio: 4/5,
    maxWidth: 400,
  },
  cardInner: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 40,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    position: 'absolute',
    top: 24,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBadge: {
    fontSize: 10,
    fontWeight: '900',
    color: '#22d3ee',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    letterSpacing: 1,
  },
  cardCounter: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  cardContent: {
    flex: 1,
    width: '100%',
    marginTop: 40,
  },
  cardContentInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  cardFooter: {
    fontSize: 9,
    color: '#475569',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
  },
  swipeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
  },
  likeIndicator: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10b981',
  },
  nopeIndicator: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#ef4444',
  },
  manageContainer: {
    flex: 1,
  },
  manageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  manageBackBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    marginRight: 16,
  },
  manageHeaderText: {
    flex: 1,
  },
  manageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  manageSubtitle: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cardList: {
    flex: 1,
  },
  cardItem: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardItemInfo: {
    flex: 1,
    marginRight: 16,
  },
  cardItemFront: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  cardItemBack: {
    fontSize: 12,
    color: '#64748b',
  },
  cardItemDelete: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
});

const markdownStyles = {
  body: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center' as const,
  },
};
