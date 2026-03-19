import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ViewState, UserStats } from '../types';
import { ArrowRight, ChevronRight, Calculator, Video, Network, Star, NotebookPen, Flame } from 'lucide-react-native';
import { getStats } from '../services/storage';

interface DashboardProps {
  setView: (view: ViewState) => void;
}

const ActionCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  color, 
  onClick 
}: { 
  icon: any, 
  title: string, 
  subtitle: string, 
  color: string,
  onClick: () => void 
}) => (
  <TouchableOpacity 
    onPress={onClick}
    style={styles.actionCard}
    activeOpacity={0.8}
  >
    <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
        <Icon size={26} color={color} />
    </View>
    <View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

export const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      const data = await getStats();
      setStats(data);
    };
    loadStats();
  }, []);

  const dailyGoal = stats?.dailyGoal || 20;
  const cardsToday = stats?.cardsLearnedToday || 0;
  const progressPercent = Math.min(Math.round((cardsToday / dailyGoal) * 100), 100);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Compact Hero "Ace your exams" Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroContent}>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>MUKTI STUDY</Text>
                <Flame size={10} color="#fb923c" />
            </View>
            <Text style={styles.heroTitle}>
                Ace your upcoming exams{'\n'}
                <Text style={styles.heroTitleHighlight}>with live AI tutoring</Text>
            </Text>
            
            <TouchableOpacity 
                onPress={() => setView('chat')}
                style={styles.heroButton}
            >
                <Text style={styles.heroButtonText}>Start Learning</Text>
                <ArrowRight size={14} color="#1d4ed8" />
            </TouchableOpacity>
        </View>
      </View>

      {/* Progress Tracker - Compact */}
      <TouchableOpacity 
        onPress={() => setView('progress')}
        style={styles.progressSection}
        activeOpacity={0.8}
      >
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>LIVE STATISTICS</Text>
            <ChevronRight size={12} color="#475569" />
        </View>
        <View style={styles.progressCard}>
            <View style={styles.progressInfo}>
                <View style={styles.progressCircleContainer}>
                    {/* Simplified progress circle for React Native without SVG */}
                    <View style={styles.progressCircle}>
                        <Text style={styles.progressPercentText}>{progressPercent}%</Text>
                    </View>
                </View>
                <View>
                    <Text style={styles.progressLabel}>Daily Goal</Text>
                    <Text style={styles.progressValue}>{cardsToday} / {dailyGoal} learned</Text>
                </View>
            </View>
            <View style={styles.progressStats}>
                <Text style={styles.statsNumber}>{cardsToday}</Text>
                <Text style={styles.statsLabel}>DONE</Text>
            </View>
        </View>
      </TouchableOpacity>

      {/* Grid of Tools */}
      <View style={styles.toolsSection}>
        <Text style={styles.sectionTitle}>POWER TOOLS</Text>
        <View style={styles.grid}>
            <ActionCard 
                icon={Video} 
                title="Video Tutor" 
                subtitle="LIVE LINK" 
                color="#22d3ee"
                onClick={() => setView('video-tutor')}
            />
            <ActionCard 
                icon={Calculator} 
                title="Problem Solver" 
                subtitle="VISUAL AI" 
                color="#34d399"
                onClick={() => setView('solver')}
            />
            <ActionCard 
                icon={NotebookPen} 
                title="Smart Notes" 
                subtitle="AI SUMMARIES" 
                color="#fb923c"
                onClick={() => setView('notes')}
            />
            <ActionCard 
                icon={Network} 
                title="AI Visualiser" 
                subtitle="CONCEPT MAPS" 
                color="#f472b6"
                onClick={() => setView('diagrams')}
            />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: '#2563eb', // Fallback for gradient
    borderRadius: 32,
    padding: 20,
    marginBottom: 24,
  },
  heroContent: {
    flexDirection: 'column',
    gap: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: 'white',
    marginRight: 4,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 28,
  },
  heroTitleHighlight: {
    color: '#bfdbfe',
  },
  heroButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  heroButtonText: {
    color: '#1d4ed8',
    fontWeight: '900',
    fontSize: 12,
    marginRight: 8,
  },
  progressSection: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 2,
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircleContainer: {
    marginRight: 16,
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: '#22d3ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'white',
  },
  progressLabel: {
    fontWeight: 'bold',
    color: '#f1f5f9',
    fontSize: 14,
  },
  progressValue: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  progressStats: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'flex-end',
  },
  statsNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: 'white',
  },
  statsLabel: {
    fontSize: 8,
    color: '#64748b',
    fontWeight: '900',
  },
  toolsSection: {
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 28,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconWrapper: {
    padding: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f1f5f9',
  },
  actionSubtitle: {
    fontSize: 9,
    color: '#64748b',
    fontWeight: 'bold',
    marginTop: 4,
  },
});
