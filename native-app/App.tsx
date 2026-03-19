import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ChatAssistant } from './components/ChatAssistant';
import { Flashcards } from './components/Flashcards';
import { Pomodoro } from './components/Pomodoro';
import { Notes } from './components/Notes';
import { Progress } from './components/Progress';
import { DiagramGenerator } from './components/DiagramGenerator';
import { ProblemSolver } from './components/ProblemSolver';
import { Settings } from './components/Settings';
import { VideoTutor } from './components/VideoTutor';
import { ViewState } from './types';
import { initStoragePersistence } from './services/storage';
import { TimerProvider, useTimer } from './context/TimerContext';
import { Bell } from 'lucide-react-native';
import Toast from 'react-native-toast-message'; // Replaced sonner with react-native-toast-message

// Note: Ensure you install react-native-dotenv to access environment variables
// import { GEMINI_API_KEY } from '@env';

const AppContent: React.FC<{ currentView: ViewState, setCurrentView: (view: ViewState) => void }> = ({ currentView, setCurrentView }) => {
  const { ringingAlarm, dismissAlarm } = useTimer();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard setView={setCurrentView} />;
      case 'chat':
        return <ChatAssistant onBack={() => setCurrentView('dashboard')} />;
      case 'flashcards':
        return <Flashcards onBack={() => setCurrentView('dashboard')} />;
      case 'pomodoro':
        return <Pomodoro onBack={() => setCurrentView('dashboard')} />;
      case 'notes':
        return <Notes onBack={() => setCurrentView('dashboard')} />;
      case 'progress':
        return <Progress setView={setCurrentView} />;
      case 'diagrams':
        return <DiagramGenerator onBack={() => setCurrentView('dashboard')} />;
      case 'solver':
        return <ProblemSolver onBack={() => setCurrentView('dashboard')} />;
      case 'settings':
        return <Settings onBack={() => setCurrentView('dashboard')} />;
      case 'video-tutor':
        return <VideoTutor onBack={() => setCurrentView('dashboard')} />;
      default:
        return <Dashboard setView={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderView()}

      {/* Global Ringing Alarm Modal */}
      <Modal
        visible={!!ringingAlarm}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[
              styles.iconContainer,
              ringingAlarm === 'focus' ? styles.iconFocus :
              ringingAlarm === 'break' ? styles.iconBreak :
              styles.iconCycle
            ]}>
              <Bell size={48} color={
                ringingAlarm === 'focus' ? '#22d3ee' :
                ringingAlarm === 'break' ? '#34d399' :
                '#c084fc'
              } />
            </View>
            <Text style={styles.modalTitle}>
              {ringingAlarm === 'focus' ? 'Focus Session Complete!' : 
               ringingAlarm === 'break' ? 'Break Time Over!' : 
               'Study Cycle Finished!'}
            </Text>
            <Text style={styles.modalDescription}>
              {ringingAlarm === 'focus' ? 'Great job! Time to take a well-deserved break.' : 
               ringingAlarm === 'break' ? 'Ready to get back to work?' : 
               'You have completed your entire study cycle. Amazing work!'}
            </Text>
            <TouchableOpacity 
              style={[
                styles.button,
                ringingAlarm === 'focus' ? styles.buttonFocus :
                ringingAlarm === 'break' ? styles.buttonBreak :
                styles.buttonCycle
              ]}
              onPress={dismissAlarm}
            >
              <Text style={styles.buttonText}>Stop Alarm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Toast position="top" />
    </Layout>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  useEffect(() => {
    initStoragePersistence();
  }, []);

  return (
    <TimerProvider>
      <AppContent currentView={currentView} setCurrentView={setCurrentView} />
    </TimerProvider>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    width: '100%',
    maxWidth: 320,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconFocus: { backgroundColor: 'rgba(34, 211, 238, 0.2)' },
  iconBreak: { backgroundColor: 'rgba(52, 211, 153, 0.2)' },
  iconCycle: { backgroundColor: 'rgba(192, 132, 252, 0.2)' },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDescription: {
    color: '#94a3b8',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonFocus: { backgroundColor: '#0891b2' },
  buttonBreak: { backgroundColor: '#059669' },
  buttonCycle: { backgroundColor: '#9333ea' },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default App;
