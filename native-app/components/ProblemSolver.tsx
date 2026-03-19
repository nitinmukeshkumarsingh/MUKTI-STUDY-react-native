import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Calculator, Wand2, Brain, CheckCircle2, ChevronRight, ChevronDown, History, Save, Trash2, Share2, Download, Copy, ExternalLink, Loader2, List, Zap, Target, Lightbulb, ChevronLeft } from 'lucide-react-native';
import { ProblemSolution } from '../types';
import { solveProblem } from '../services/geminiService';
import { getStats, updateStats } from '../services/storage';
import Markdown from 'react-native-markdown-display';

export const ProblemSolver: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [problem, setProblem] = useState('');
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<ProblemSolution | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);

  const handleSolve = async () => {
    if (!problem.trim() || isSolving) return;
    setIsSolving(true);
    try {
      const result = await solveProblem(problem);
      setSolution(result);
      setExpandedSteps([0]); // Expand first step by default
      await updateStats(true);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to solve problem. Please try again.");
    }
    setIsSolving(false);
  };

  const toggleStep = (index: number) => {
    setExpandedSteps(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
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
        <Text style={styles.navTitle}>Problem Solver</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Input Section */}
        <View style={styles.inputCard}>
            <View style={styles.inputHeader}>
                <Calculator size={20} color="#0891b2" />
                <Text style={styles.inputTitle}>PROBLEM SOLVER</Text>
            </View>
            <View style={styles.inputRow}>
                <TextInput 
                  value={problem}
                  onChangeText={setProblem}
                  placeholder="Paste problem or describe it..."
                  placeholderTextColor="#64748b"
                  style={styles.problemInput}
                  multiline
                />
                <TouchableOpacity onPress={handleSolve} disabled={isSolving} style={styles.solveBtn}>
                    {isSolving ? <ActivityIndicator size="small" color="white" /> : <Wand2 size={20} color="white" />}
                </TouchableOpacity>
            </View>
            <Text style={styles.inputHint}>AI will break down any complex problem into logical, easy-to-follow steps.</Text>
        </View>

        {!solution && !isSolving && (
            <View style={styles.emptyState}>
                <View style={styles.emptyIconWrapper}>
                    <Calculator size={48} color="#1e293b" />
                </View>
                <Text style={styles.emptyTitle}>Stuck on a Problem?</Text>
                <Text style={styles.emptyText}>Paste any math, science, or logic problem above for a step-by-step breakdown.</Text>
            </View>
        )}

        {isSolving && (
            <View style={styles.processingState}>
                <ActivityIndicator size="large" color="#0891b2" />
                <Text style={styles.processingTitle}>AI is thinking...</Text>
                <Text style={styles.processingText}>Deconstructing the problem and formulating a logical solution path.</Text>
            </View>
        )}

        {solution && (
            <View style={styles.solutionContainer}>
                {/* Final Answer Card */}
                <View style={styles.answerCard}>
                    <View style={styles.cardHeader}>
                        <Target size={18} color="#10b981" />
                        <Text style={styles.cardTitle}>FINAL ANSWER</Text>
                    </View>
                    <View style={styles.answerBox}>
                        <Markdown style={markdownStyles}>
                            {solution.finalAnswer}
                        </Markdown>
                    </View>
                </View>

                {/* Steps Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>STEP-BY-STEP BREAKDOWN</Text>
                    <List size={16} color="#64748b" />
                </View>

                <View style={styles.stepsList}>
                    {solution.steps.map((step, i) => (
                        <View key={i} style={styles.stepItem}>
                            <TouchableOpacity onPress={() => toggleStep(i)} style={styles.stepHeader}>
                                <View style={styles.stepNumberWrapper}>
                                    <Text style={styles.stepNumber}>{i + 1}</Text>
                                </View>
                                <Text style={styles.stepTitle} numberOfLines={1}>{step.title}</Text>
                                {expandedSteps.includes(i) ? <ChevronDown size={20} color="#475569" /> : <ChevronRight size={20} color="#475569" />}
                            </TouchableOpacity>
                            
                            {expandedSteps.includes(i) && (
                                <View style={styles.stepContent}>
                                    <Markdown style={markdownStyles}>
                                        {step.content}
                                    </Markdown>
                                    {step.explanation && (
                                        <View style={styles.explanationBox}>
                                            <Lightbulb size={14} color="#eab308" />
                                            <Text style={styles.explanationText}>{step.explanation}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Key Concepts */}
                <View style={styles.conceptsCard}>
                    <View style={styles.cardHeader}>
                        <Brain size={18} color="#8b5cf6" />
                        <Text style={styles.cardTitle}>CORE CONCEPTS USED</Text>
                    </View>
                    <View style={styles.conceptsList}>
                        {solution.concepts.map((concept, i) => (
                            <View key={i} style={styles.conceptItem}>
                                <Zap size={14} color="#eab308" />
                                <Text style={styles.conceptText}>{concept}</Text>
                            </View>
                        ))}
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
  problemInput: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: 'white',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  solveBtn: {
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
  solutionContainer: {
    gap: 24,
  },
  answerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
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
  answerBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 2,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  stepNumberWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  stepTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  stepContent: {
    padding: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.03)',
  },
  explanationBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(234, 179, 8, 0.05)',
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.1)',
  },
  explanationText: {
    flex: 1,
    fontSize: 12,
    color: '#cbd5e1',
    lineHeight: 18,
  },
  conceptsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 40,
  },
  conceptsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conceptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  conceptText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
});

const markdownStyles = {
  body: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },
};
