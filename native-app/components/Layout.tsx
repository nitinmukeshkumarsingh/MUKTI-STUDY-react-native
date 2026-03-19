import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Dimensions } from 'react-native';
import { ViewState } from '../types';
import { LayoutDashboard, MessageSquare, Layers, Clock, NotebookPen, User } from 'lucide-react-native';
import { getSettings, getTimerState } from '../services/storage';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const mainViews: ViewState[] = ['dashboard', 'chat', 'flashcards', 'notes', 'pomodoro'];

const NavItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void 
}) => (
  <TouchableOpacity
    onPress={onClick}
    style={styles.navItem}
    activeOpacity={0.7}
  >
    <View style={styles.navItemContent}>
      <Icon size={24} color={active ? '#22d3ee' : '#64748b'} strokeWidth={active ? 2.5 : 2} />
      <Text style={[
        styles.navLabel,
        { color: active ? '#22d3ee' : '#64748b', opacity: active ? 1 : 0.6 }
      ]}>
        {label}
      </Text>
    </View>
  </TouchableOpacity>
);

export const Layout: React.FC<LayoutProps> = ({ children, currentView, setView }) => {
  const [settings, setSettings] = useState<any>({ name: 'Student' });
  const [timerState, setTimerState] = useState<{ active: boolean, mode: 'focus' | 'break' }>({ active: false, mode: 'focus' });

  useEffect(() => {
    const handleUpdate = async () => {
      const s = await getSettings();
      if (s) setSettings(s);
      
      const timer = await getTimerState();
      setTimerState({
        active: !!(timer && timer.isActive),
        mode: timer?.mode || 'focus'
      });
    };
    
    handleUpdate(); // Initial call
    const interval = setInterval(handleUpdate, 2000); 
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const showHeader = currentView === 'dashboard';
  const showNav = currentView !== 'video-tutor';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.main}>
        
        {/* Persistent Header */}
        {showHeader && (
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greetingText} numberOfLines={1}>
                {getGreeting()}, <Text style={styles.nameText}>{settings.name}</Text>
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                onPress={() => setView('settings')}
                style={styles.profileButton}
              >
                {settings.profileImage ? (
                  <Image source={{ uri: settings.profileImage }} style={styles.profileImage} />
                ) : (
                  <User size={20} color="white" />
                )}
              </TouchableOpacity>
              {timerState.active && (
                <View style={[
                  styles.timerBadge,
                  { backgroundColor: timerState.mode === 'focus' ? '#22d3ee' : '#10b981' }
                ]}>
                  <Clock size={8} color="white" strokeWidth={3} />
                </View>
              )}
            </View>
          </View>
        )}

        {/* Content Area */}
        <View style={styles.contentArea}>
            {children}
        </View>

        {/* Bottom Navigation */}
        {showNav && (
          <View style={styles.bottomNav}>
            <NavItem 
              icon={LayoutDashboard} 
              label="Home" 
              active={currentView === 'dashboard'} 
              onClick={() => setView('dashboard')} 
            />
            <NavItem 
              icon={MessageSquare} 
              label="Tutor" 
              active={currentView === 'chat'} 
              onClick={() => setView('chat')} 
            />
            <NavItem 
              icon={Layers} 
              label="Cards" 
              active={currentView === 'flashcards'} 
              onClick={() => setView('flashcards')} 
            />
            <NavItem 
              icon={NotebookPen} 
              label="Notes" 
              active={currentView === 'notes'} 
              onClick={() => setView('notes')} 
            />
            <NavItem 
              icon={Clock} 
              label="Focus" 
              active={currentView === 'pomodoro'} 
              onClick={() => setView('pomodoro')} 
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1221',
  },
  main: {
    flex: 1,
    backgroundColor: '#0b1221',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  nameText: {
    color: '#cffafe',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#2563eb', // Fallback for gradient
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  timerBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0b1221',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  contentArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemContent: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
