import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Dimensions, Platform } from 'react-native';
import { Share2, Download, Copy, RefreshCw, Wand2, Brain, Network, GitBranch, Layout, Maximize2, ZoomIn, ZoomOut, Trash2, Save, History, Loader2, ChevronRight, ChevronLeft, Image as ImageIcon } from 'lucide-react-native';
import { DiagramData } from '../types';
import { generateDiagram } from '../services/geminiService';
import { getStats, updateStats } from '../services/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DiagramGeneratorProps {
  onBack?: () => void;
}

export const DiagramGenerator: React.FC<DiagramGeneratorProps> = ({ onBack }) => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [diagram, setDiagram] = useState<DiagramData | null>(null);
  const [diagramType, setDiagramType] = useState<'flowchart' | 'mindmap' | 'sequence'>('flowchart');

  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const result = await generateDiagram(topic, diagramType);
      setDiagram(result);
      await updateStats(true);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to generate diagram. Please try again.");
    }
    setIsGenerating(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>AI Visualiser</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Input Section */}
        <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
                <Network size={20} color="#0891b2" />
                <Text style={styles.inputTitle}>VISUAL LEARNING</Text>
            </View>
            <View style={styles.inputRow}>
                <TextInput 
                  value={topic}
                  onChangeText={setTopic}
                  placeholder="Enter complex topic..."
                  placeholderTextColor="#64748b"
                  style={styles.topicInput}
                />
                <TouchableOpacity onPress={handleGenerate} disabled={isGenerating} style={styles.genBtn}>
                    {isGenerating ? <ActivityIndicator size="small" color="white" /> : <Wand2 size={20} color="white" />}
                </TouchableOpacity>
            </View>
            
            <View style={styles.typeSelector}>
                <TouchableOpacity onPress={()=>setDiagramType('flowchart')} style={[styles.typeBtn, diagramType === 'flowchart' && styles.activeTypeBtn]}>
                    <GitBranch size={14} color={diagramType === 'flowchart' ? 'white' : '#64748b'} />
                    <Text style={[styles.typeBtnText, diagramType === 'flowchart' && styles.activeTypeBtnText]}>FLOW</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setDiagramType('mindmap')} style={[styles.typeBtn, diagramType === 'mindmap' && styles.activeTypeBtn]}>
                    <Brain size={14} color={diagramType === 'mindmap' ? 'white' : '#64748b'} />
                    <Text style={[styles.typeBtnText, diagramType === 'mindmap' && styles.activeTypeBtnText]}>MINDMAP</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setDiagramType('sequence')} style={[styles.typeBtn, diagramType === 'sequence' && styles.activeTypeBtn]}>
                    <Layout size={14} color={diagramType === 'sequence' ? 'white' : '#64748b'} />
                    <Text style={[styles.typeBtnText, diagramType === 'sequence' && styles.activeTypeBtnText]}>SEQUENCE</Text>
                </TouchableOpacity>
            </View>
        </View>

        {!diagram && !isGenerating && (
            <View style={styles.emptyState}>
                <View style={styles.emptyIconWrapper}>
                    <Network size={48} color="#1e293b" />
                </View>
                <Text style={styles.emptyTitle}>Visualize Knowledge</Text>
                <Text style={styles.emptyText}>AI will generate complex diagrams to help you understand relationships and processes.</Text>
            </View>
        )}

        {isGenerating && (
            <View style={styles.processingState}>
                <ActivityIndicator size="large" color="#0891b2" />
                <Text style={styles.processingTitle}>Architecting Diagram...</Text>
                <Text style={styles.processingText}>Analyzing relationships and building the visual structure.</Text>
            </View>
        )}

        {diagram && (
            <View style={styles.diagramContainer}>
                <View style={styles.diagramCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.diagramTitle}>{diagram.title}</Text>
                        <View style={styles.cardActions}>
                            <TouchableOpacity style={styles.actionBtn}><Share2 size={16} color="#94a3b8" /></TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn}><Download size={16} color="#94a3b8" /></TouchableOpacity>
                        </View>
                    </View>
                    
                    {/* Diagram Placeholder */}
                    <View style={styles.mermaidPlaceholder}>
                        <Text style={styles.placeholderText}>
                            [Mermaid Diagram Rendering]
                        </Text>
                        <Text style={styles.placeholderSub}>
                            In a real native app, this would use react-native-webview to render the Mermaid code.
                        </Text>
                        <View style={styles.codeBox}>
                            <Text style={styles.codeText} numberOfLines={10}>{diagram.code}</Text>
                        </View>
                    </View>

                    <View style={styles.explanationCard}>
                        <Text style={styles.explanationTitle}>EXPLANATION</Text>
                        <Text style={styles.explanationText}>{diagram.explanation}</Text>
                    </View>
                </View>
            </View>
        )}

      </ScrollView>
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
  topicInput: {
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
  genBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#0891b2',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 6,
  },
  activeTypeBtn: {
    backgroundColor: '#0891b2',
  },
  typeBtnText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 1,
  },
  activeTypeBtnText: {
    color: 'white',
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
  diagramContainer: {
    marginBottom: 40,
  },
  diagramCard: {
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  diagramTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    marginRight: 16,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
  },
  mermaidPlaceholder: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#0891b2',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  placeholderSub: {
    color: '#64748b',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 16,
  },
  codeBox: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
    borderRadius: 12,
  },
  codeText: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  explanationCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
  },
  explanationTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 2,
    marginBottom: 12,
  },
  explanationText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
  },
});
