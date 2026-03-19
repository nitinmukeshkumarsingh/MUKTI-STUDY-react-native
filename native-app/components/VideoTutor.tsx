import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Youtube, Wand2, MessageSquare, Brain, Clock, List, CheckCircle2, Play, Pause, RotateCcw, ChevronRight, Search, History, Bookmark, Share2, Download, ExternalLink, Loader2, Send, ChevronLeft } from 'lucide-react-native';
import { VideoSummary } from '../types';
import { generateVideoSummary, chatWithVideo } from '../services/geminiService';
import { getStats, updateStats } from '../services/storage';
import Markdown from 'react-native-markdown-display';

export const VideoTutor: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<VideoSummary | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
  const [isChatting, setIsChatting] = useState(false);

  const handleProcess = async () => {
    if (!url.trim()) return;
    setIsProcessing(true);
    try {
      const result = await generateVideoSummary(url);
      setSummary(result);
      setChatHistory([]);
      await updateStats(true);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to process video. Please check the URL and try again.");
    }
    setIsProcessing(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim() || !summary || isChatting) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    
    setIsChatting(true);
    try {
      const response = await chatWithVideo(url, userMsg, summary);
      setChatHistory(prev => [...prev, { role: 'model', content: response }]);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to get response. Please try again.");
    }
    setIsChatting(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.topNav}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Video Tutor</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* URL Input Section */}
        <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
                <Youtube size={20} color="#ef4444" />
                <Text style={styles.inputTitle}>VIDEO TUTOR</Text>
            </View>
            <View style={styles.inputRow}>
                <TextInput 
                  value={url}
                  onChangeText={setUrl}
                  placeholder="Paste YouTube URL..."
                  placeholderTextColor="#64748b"
                  style={styles.urlInput}
                />
                <TouchableOpacity onPress={handleProcess} disabled={isProcessing} style={styles.processBtn}>
                    {isProcessing ? <ActivityIndicator size="small" color="white" /> : <Wand2 size={20} color="white" />}
                </TouchableOpacity>
            </View>
            <Text style={styles.inputHint}>AI will watch, summarize, and tutor you on any educational video.</Text>
        </View>

        {!summary && !isProcessing && (
            <View style={styles.emptyState}>
                <View style={styles.emptyIconWrapper}>
                    <Youtube size={48} color="#1e293b" />
                </View>
                <Text style={styles.emptyTitle}>Ready to Learn?</Text>
                <Text style={styles.emptyText}>Paste a YouTube link above to get an AI-powered summary and interactive tutor.</Text>
            </View>
        )}

        {isProcessing && (
            <View style={styles.processingState}>
                <ActivityIndicator size="large" color="#0891b2" />
                <Text style={styles.processingTitle}>AI is watching the video...</Text>
                <Text style={styles.processingText}>This usually takes 15-30 seconds depending on video length.</Text>
            </View>
        )}

        {summary && (
            <View style={styles.summaryContainer}>
                {/* Video Placeholder */}
                <View style={styles.videoPlaceholder}>
                    <View style={styles.playIconWrapper}>
                        <Play size={32} color="white" fill="white" />
                    </View>
                    <Text style={styles.videoTitle}>{summary.title}</Text>
                </View>

                {/* Summary Tabs */}
                <View style={styles.summaryCard}>
                    <View style={styles.cardHeader}>
                        <Brain size={18} color="#0891b2" />
                        <Text style={styles.cardTitle}>KEY CONCEPTS</Text>
                    </View>
                    <View style={styles.conceptsList}>
                        {summary.keyConcepts.map((concept, i) => (
                            <View key={i} style={styles.conceptItem}>
                                <CheckCircle2 size={14} color="#10b981" />
                                <Text style={styles.conceptText}>{concept}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.summaryCard}>
                    <View style={styles.cardHeader}>
                        <List size={18} color="#8b5cf6" />
                        <Text style={styles.cardTitle}>DETAILED SUMMARY</Text>
                    </View>
                    <Markdown style={markdownStyles}>
                        {summary.summary}
                    </Markdown>
                </View>

                {/* Chat Section */}
                <View style={styles.chatCard}>
                    <View style={styles.cardHeader}>
                        <MessageSquare size={18} color="#0891b2" />
                        <Text style={styles.cardTitle}>ASK THE TUTOR</Text>
                    </View>
                    
                    <View style={styles.chatHistory}>
                        {chatHistory.map((msg, i) => (
                            <View key={i} style={[styles.chatMsg, msg.role === 'user' ? styles.userMsg : styles.modelMsg]}>
                                <Text style={[styles.chatMsgText, msg.role === 'user' && { color: 'white' }]}>{msg.content}</Text>
                            </View>
                        ))}
                        {isChatting && (
                            <View style={[styles.chatMsg, styles.modelMsg]}>
                                <ActivityIndicator size="small" color="#0891b2" />
                            </View>
                        )}
                    </View>

                    <View style={styles.chatInputRow}>
                        <TextInput 
                          value={chatInput}
                          onChangeText={setChatInput}
                          placeholder="Ask about the video..."
                          placeholderTextColor="#64748b"
                          style={styles.chatInput}
                          multiline
                        />
                        <TouchableOpacity onPress={handleChat} disabled={isChatting} style={styles.sendBtn}>
                            <Send size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  inputCard: {
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  inputTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  urlInput: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  processBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#0891b2',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputHint: {
    fontSize: 10,
    color: '#475569',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  emptyText: {
    color: '#94a3b8',
    textAlign: 'center',
    paddingHorizontal: 40,
    fontSize: 14,
  },
  processingState: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 24,
    marginBottom: 8,
  },
  processingText: {
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 40,
    fontSize: 12,
  },
  summaryContainer: {
    gap: 24,
  },
  videoPlaceholder: {
    width: '100%',
    aspectRatio: 16/9,
    backgroundColor: '#000',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    overflow: 'hidden',
  },
  playIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  videoTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 2,
  },
  conceptsList: {
    gap: 12,
  },
  conceptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: 16,
  },
  conceptText: {
    color: '#f1f5f9',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  chatCard: {
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 40,
  },
  chatHistory: {
    gap: 12,
    marginBottom: 20,
  },
  chatMsg: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '85%',
  },
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#0891b2',
  },
  modelMsg: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chatMsgText: {
    fontSize: 13,
    color: '#f1f5f9',
    lineHeight: 18,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: 'white',
    fontSize: 13,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#0891b2',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const markdownStyles = {
  body: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },
};
