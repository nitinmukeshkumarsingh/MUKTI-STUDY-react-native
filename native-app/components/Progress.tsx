import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { BarChart3, TrendingUp, Calendar, Trophy, Target, Flame, Brain, Clock, CheckCircle2, ArrowUpRight, ArrowDownRight, Zap, Star, Award, History, LayoutGrid, List, ChevronLeft } from 'lucide-react-native';
import { UserStats, StudySession, ViewState } from '../types';
import { getStats, getStudySessions } from '../services/storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProgressProps {
  setView?: (view: ViewState) => void;
}

export const Progress: React.FC<ProgressProps> = ({ setView }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    const loadData = async () => {
      setStats(await getStats());
      setSessions(await getStudySessions());
    };
    loadData();
  }, []);

  const calculateDailyActivity = () => {
    const activity = Array(7).fill(0);
    const now = new Date();
    sessions.forEach(session => {
      const sessionDate = new Date(session.timestamp);
      const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        activity[6 - diffDays] += session.duration;
      }
    });
    return activity;
  };

  const dailyActivity = calculateDailyActivity();
  const maxActivity = Math.max(...dailyActivity, 1);

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => setView?.('dashboard')} style={styles.backBtn}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Progress</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Stats */}
        <View style={styles.headerStats}>
            <View style={styles.mainStat}>
                <View style={styles.statIconWrapper}>
                    <Trophy size={32} color="#eab308" />
                </View>
                <View>
                    <Text style={styles.mainStatVal}>{stats?.totalPoints || 0}</Text>
                    <Text style={styles.mainStatLabel}>TOTAL POINTS</Text>
                </View>
            </View>
            <View style={styles.streakBadge}>
                <Flame size={16} color="#ef4444" />
                <Text style={styles.streakText}>{stats?.streak || 0} DAY STREAK</Text>
            </View>
        </View>

        {/* Activity Chart (Simplified) */}
        <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>STUDY ACTIVITY</Text>
                <View style={styles.chartLegend}>
                    <View style={[styles.legendDot, { backgroundColor: '#0891b2' }]} />
                    <Text style={styles.legendText}>Minutes</Text>
                </View>
            </View>
            
            <View style={styles.barChart}>
                {dailyActivity.map((val, i) => (
                    <View key={i} style={styles.barWrapper}>
                        <View style={styles.barBackground}>
                            <View style={[styles.barFill, { height: `${(val / maxActivity) * 100}%` }]} />
                        </View>
                        <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
                    </View>
                ))}
            </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
            <View style={styles.statBox}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(34, 211, 238, 0.1)' }]}>
                    <Brain size={20} color="#22d3ee" />
                </View>
                <Text style={styles.statBoxVal}>{stats?.cardsMastered || 0}</Text>
                <Text style={styles.statBoxLabel}>Mastered</Text>
            </View>
            <View style={styles.statBox}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <CheckCircle2 size={20} color="#10b981" />
                </View>
                <Text style={styles.statBoxVal}>{stats?.sessionsCompleted || 0}</Text>
                <Text style={styles.statBoxLabel}>Sessions</Text>
            </View>
            <View style={styles.statBox}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
                    <Clock size={20} color="#eab308" />
                </View>
                <Text style={styles.statBoxVal}>{Math.round((stats?.totalStudyTime || 0) / 60)}h</Text>
                <Text style={styles.statBoxLabel}>Time</Text>
            </View>
            <View style={styles.statBox}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                    <Target size={20} color="#8b5cf6" />
                </View>
                <Text style={styles.statBoxVal}>{stats?.accuracy || 0}%</Text>
                <Text style={styles.statBoxLabel}>Accuracy</Text>
            </View>
        </View>

        {/* Recent Achievements */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ACHIEVEMENTS</Text>
            <TouchableOpacity><Text style={styles.viewAll}>View All</Text></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementScroll}>
            <View style={styles.achievementCard}>
                <View style={[styles.awardCircle, { backgroundColor: '#0891b2' }]}>
                    <Zap size={24} color="white" />
                </View>
                <Text style={styles.achievementName}>Fast Learner</Text>
                <Text style={styles.achievementDesc}>50 cards in 1 hour</Text>
            </View>
            <View style={styles.achievementCard}>
                <View style={[styles.awardCircle, { backgroundColor: '#10b981' }]}>
                    <Star size={24} color="white" />
                </View>
                <Text style={styles.achievementName}>Perfect Week</Text>
                <Text style={styles.achievementDesc}>7 day streak</Text>
            </View>
            <View style={styles.achievementCard}>
                <View style={[styles.awardCircle, { backgroundColor: '#8b5cf6' }]}>
                    <Award size={24} color="white" />
                </View>
                <Text style={styles.achievementName}>Mastermind</Text>
                <Text style={styles.achievementDesc}>1000 total points</Text>
            </View>
        </ScrollView>

        {/* Recent History */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT SESSIONS</Text>
            <History size={16} color="#64748b" />
        </View>

        <View style={styles.historyList}>
            {sessions.slice(0, 5).map(session => (
                <View key={session.id} style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                        <Clock size={16} color="#94a3b8" />
                    </View>
                    <View style={styles.historyInfo}>
                        <Text style={styles.historyTitle}>{session.type.toUpperCase()}</Text>
                        <Text style={styles.historyDate}>{new Date(session.timestamp).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.historyMeta}>
                        <Text style={styles.historyVal}>+{session.points} pts</Text>
                        <Text style={styles.historySub}>{session.duration}m</Text>
                    </View>
                </View>
            ))}
        </View>

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
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  mainStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainStatVal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  mainStatLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  streakText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  chartCard: {
    backgroundColor: '#1e293b',
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 2,
  },
  chartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 8,
  },
  barWrapper: {
    alignItems: 'center',
    width: 24,
  },
  barBackground: {
    width: 8,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 4,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  barFill: {
    width: '100%',
    backgroundColor: '#0891b2',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#475569',
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statBox: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statBoxVal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statBoxLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 2,
  },
  viewAll: {
    fontSize: 12,
    color: '#0891b2',
    fontWeight: 'bold',
  },
  achievementScroll: {
    flexGrow: 0,
    marginBottom: 32,
  },
  achievementCard: {
    width: 140,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  awardCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 10,
    color: '#64748b',
  },
  historyMeta: {
    alignItems: 'flex-end',
  },
  historyVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10b981',
  },
  historySub: {
    fontSize: 10,
    color: '#64748b',
  },
});
