import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Switch, ActivityIndicator, Alert } from 'react-native';
import { Play, Pause, RotateCcw, Settings, Coffee, Brain, Bell, Volume2, VolumeX, Music, Upload, Trash2, Check, ChevronRight, Timer, Zap, Moon, Sun, X, ChevronLeft } from 'lucide-react-native';
import { TimerSettings, TimerMode } from '../types';
import { getTimerSettings, saveTimerSettings } from '../services/storage';

const DEFAULT_SETTINGS: TimerSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
  alarmSound: 'default',
  volume: 0.7
};

interface PomodoroProps {
  onBack?: () => void;
}

export const Pomodoro: React.FC<PomodoroProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      const saved = await getTimerSettings();
      setSettings(saved);
      setTempSettings(saved);
      setTimeLeft(saved.focus * 60);
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // In a real native app, we'd trigger a notification and sound here
    Alert.alert(
      mode === 'focus' ? 'Focus Complete!' : 'Break Over!',
      mode === 'focus' ? 'Time for a well-deserved break.' : 'Ready to get back to work?',
      [{ text: 'OK' }]
    );

    if (mode === 'focus') {
      setMode('shortBreak');
      setTimeLeft(settings.shortBreak * 60);
      if (settings.autoStartBreaks) setIsActive(true);
    } else {
      setMode('focus');
      setTimeLeft(settings.focus * 60);
      if (settings.autoStartFocus) setIsActive(true);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(settings[mode] * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(settings[newMode] * 60);
  };

  const saveSettings = async () => {
    setSettings(tempSettings);
    await saveTimerSettings(tempSettings);
    setTimeLeft(tempSettings[mode] * 60);
    setShowSettings(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (timeLeft / (settings[mode] * 60));
  const modeColor = mode === 'focus' ? '#0891b2' : mode === 'shortBreak' ? '#10b981' : '#8b5cf6';

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Pomodoro</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity 
            onPress={() => switchMode('focus')} 
            style={[styles.modeBtn, mode === 'focus' && { backgroundColor: 'rgba(8, 145, 178, 0.1)' }]}
          >
            <Brain size={16} color={mode === 'focus' ? '#0891b2' : '#64748b'} />
            <Text style={[styles.modeBtnText, mode === 'focus' && { color: '#0891b2' }]}>FOCUS</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => switchMode('shortBreak')} 
            style={[styles.modeBtn, mode === 'shortBreak' && { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}
          >
            <Coffee size={16} color={mode === 'shortBreak' ? '#10b981' : '#64748b'} />
            <Text style={[styles.modeBtnText, mode === 'shortBreak' && { color: '#10b981' }]}>BREAK</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => switchMode('longBreak')} 
            style={[styles.modeBtn, mode === 'longBreak' && { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}
          >
            <Moon size={16} color={mode === 'longBreak' ? '#8b5cf6' : '#64748b'} />
            <Text style={[styles.modeBtnText, mode === 'longBreak' && { color: '#8b5cf6' }]}>REST</Text>
          </TouchableOpacity>
        </View>

        {/* Timer Display */}
        <View style={styles.timerCard}>
           <View style={styles.progressContainer}>
              {/* Simplified Progress Circle using View borders */}
              <View style={[styles.progressCircle, { borderColor: 'rgba(255,255,255,0.05)' }]} />
              <View style={[styles.progressCircleOverlay, { 
                  borderColor: modeColor,
                  transform: [{ rotate: `${progress * 360}deg` }] 
              }]} />
              
              <View style={styles.timeDisplay}>
                <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
                <Text style={styles.modeLabel}>{mode.toUpperCase()}</Text>
              </View>
           </View>

           <View style={styles.controls}>
              <TouchableOpacity onPress={resetTimer} style={styles.controlBtn}>
                <RotateCcw size={24} color="#94a3b8" />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={toggleTimer} style={[styles.playBtn, { backgroundColor: modeColor }]}>
                {isActive ? <Pause size={32} color="white" fill="white" /> : <Play size={32} color="white" fill="white" />}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.controlBtn}>
                <Settings size={24} color="#94a3b8" />
              </TouchableOpacity>
           </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
            <View style={styles.statCard}>
                <Zap size={20} color="#eab308" />
                <View>
                    <Text style={styles.statVal}>4</Text>
                    <Text style={styles.statLabel}>Sessions</Text>
                </View>
            </View>
            <View style={styles.statCard}>
                <Timer size={20} color="#0891b2" />
                <View>
                    <Text style={styles.statVal}>120</Text>
                    <Text style={styles.statLabel}>Minutes</Text>
                </View>
            </View>
        </View>

        {/* Sound Settings Quick Toggle */}
        <View style={styles.quickSettings}>
            <View style={styles.quickSettingItem}>
                <View style={styles.quickSettingInfo}>
                    <Volume2 size={20} color="#94a3b8" />
                    <Text style={styles.quickSettingText}>Sound Effects</Text>
                </View>
                <Switch 
                  value={settings.soundEnabled} 
                  onValueChange={(val) => setSettings({...settings, soundEnabled: val})}
                  trackColor={{ false: '#334155', true: '#0891b2' }}
                />
            </View>
        </View>

      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Timer Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <X size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.settingSectionTitle}>DURATION (MINUTES)</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Focus</Text>
                <TextInput 
                  keyboardType="numeric"
                  value={tempSettings.focus.toString()}
                  onChangeText={(val) => setTempSettings({...tempSettings, focus: parseInt(val) || 0})}
                  style={styles.modalInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Short Break</Text>
                <TextInput 
                  keyboardType="numeric"
                  value={tempSettings.shortBreak.toString()}
                  onChangeText={(val) => setTempSettings({...tempSettings, shortBreak: parseInt(val) || 0})}
                  style={styles.modalInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Long Break</Text>
                <TextInput 
                  keyboardType="numeric"
                  value={tempSettings.longBreak.toString()}
                  onChangeText={(val) => setTempSettings({...tempSettings, longBreak: parseInt(val) || 0})}
                  style={styles.modalInput}
                />
              </View>

              <Text style={styles.settingSectionTitle}>AUTOMATION</Text>
              
              <View style={styles.switchGroup}>
                <Text style={styles.inputLabel}>Auto-start Breaks</Text>
                <Switch 
                  value={tempSettings.autoStartBreaks}
                  onValueChange={(val) => setTempSettings({...tempSettings, autoStartBreaks: val})}
                  trackColor={{ false: '#334155', true: '#0891b2' }}
                />
              </View>

              <View style={styles.switchGroup}>
                <Text style={styles.inputLabel}>Auto-start Focus</Text>
                <Switch 
                  value={tempSettings.autoStartFocus}
                  onValueChange={(val) => setTempSettings({...tempSettings, autoStartFocus: val})}
                  trackColor={{ false: '#334155', true: '#0891b2' }}
                />
              </View>
            </ScrollView>

            <TouchableOpacity onPress={saveSettings} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 6,
    marginBottom: 32,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  modeBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 1,
  },
  timerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 48,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 32,
  },
  progressContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  progressCircle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 120,
    borderWidth: 8,
  },
  progressCircleOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 120,
    borderWidth: 8,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  timeDisplay: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: 'white',
    fontVariant: ['tabular-nums'],
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 4,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
  },
  quickSettings: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  quickSettingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickSettingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickSettingText: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 32,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modalBody: {
    marginBottom: 32,
  },
  settingSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 2,
    marginBottom: 16,
    marginTop: 8,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  switchGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  modalInput: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: 'white',
    width: 80,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  saveBtn: {
    backgroundColor: '#0891b2',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
