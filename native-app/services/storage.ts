import AsyncStorage from '@react-native-async-storage/async-storage';
import { Deck, Flashcard, UserStats, Note, UserSettings, ChatMessage, Folder, UserProfile, StudySession } from '../types';

const KEYS = {
  STATS: 'lumina_stats',
  DECKS: 'lumina_decks',
  NOTES: 'lumina_notes',
  FOLDERS: 'lumina_folders',
  SETTINGS: 'lumina_settings',
  PROFILE: 'lumina_profile',
  SESSIONS: 'lumina_sessions',
  API_KEY: 'lumina_custom_api_key',
  TIMER: 'lumina_timer_state',
  TIMER_SETTINGS: 'lumina_timer_settings'
};

const getTodayDate = () => new Date().toISOString().split('T')[0];

// Storage in React Native is asynchronous. 
// We'll provide async versions of the getters/setters.

export const initStoragePersistence = async () => {
  // No-op in React Native as AsyncStorage is persistent by default
};

export const getSettings = async (): Promise<UserSettings> => {
  const stored = await AsyncStorage.getItem(KEYS.SETTINGS);
  const defaultSettings: UserSettings = {
    name: 'Student',
    academicLevel: 'High School',
    profileImage: null,
    aiProvider: 'openrouter',
    textModel: 'openrouter:openrouter/free',
    mediaModel: 'openrouter:openrouter/free',
    diagramModel: 'wiki-common'
  };
  if (stored) {
    const parsed = JSON.parse(stored);
    return parsed;
  }
  return defaultSettings;
};

export const saveSettings = async (settings: UserSettings) => {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

export const getCustomApiKey = async (): Promise<string> => {
  return (await AsyncStorage.getItem(KEYS.API_KEY)) || '';
};

export const saveCustomApiKey = async (key: string) => {
  await AsyncStorage.setItem(KEYS.API_KEY, key);
};

export const getActiveApiKey = async (): Promise<string> => {
  const settings = await getSettings();
  const custom = await getCustomApiKey();
  
  if (settings.aiProvider === 'gemini' && settings.geminiKey) return settings.geminiKey;
  if (settings.aiProvider === 'groq' && settings.groqKey) return settings.groqKey;
  if (settings.aiProvider === 'openrouter' && settings.openrouterKey) return settings.openrouterKey;

  if (settings.aiProvider === 'gemini' && custom) return custom;

  if (settings.aiProvider === 'gemini') return process.env.GEMINI_API_KEY || '';
  if (settings.aiProvider === 'groq') return process.env.GROQ_API_KEY || '';
  if (settings.aiProvider === 'openrouter') return process.env.OPENROUTER_API_KEY || '';

  return '';
};

export const getGeminiKey = async (): Promise<string> => {
  const settings = await getSettings();
  const custom = await getCustomApiKey();
  return settings.geminiKey || custom || process.env.GEMINI_API_KEY || '';
};

export const getStats = async (): Promise<UserStats> => {
  const stored = await AsyncStorage.getItem(KEYS.STATS);
  const defaultStats: UserStats = {
    cardsLearnedToday: 0,
    mistakesToday: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    totalCardsLearned: 0,
    totalMistakes: 0,
    weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
    dailyGoal: 20,
    totalPoints: 0,
    streak: 0,
    cardsMastered: 0,
    sessionsCompleted: 0,
    totalStudyTime: 0,
    accuracy: 0
  };

  if (!stored) return defaultStats;

  const stats = JSON.parse(stored);
  const today = getTodayDate();

  if (stats.lastStudyDate !== today) {
    stats.cardsLearnedToday = 0;
    stats.mistakesToday = 0;
  }
  
  return stats;
};

export const updateStats = async (learned: boolean): Promise<UserStats> => {
  const stats = await getStats();
  const today = getTodayDate();
  const todayIndex = new Date().getDay();

  if (learned) {
      stats.cardsLearnedToday += 1;
      stats.totalCardsLearned += 1;
      stats.totalPoints += 10;
      stats.weeklyActivity[todayIndex] = (stats.weeklyActivity[todayIndex] || 0) + 1;
  } else {
      stats.mistakesToday += 1;
      stats.totalMistakes += 1;
  }

  if (stats.lastStudyDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (stats.lastStudyDate === yesterdayStr) {
          stats.currentStreak += 1;
          stats.streak = stats.currentStreak;
      } else {
          stats.currentStreak = 1;
          stats.streak = 1;
      }

      if (stats.currentStreak > stats.longestStreak) {
          stats.longestStreak = stats.currentStreak;
      }
      
      stats.lastStudyDate = today;
  }

  await AsyncStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  return stats;
};

export const getDecks = async (): Promise<Deck[]> => {
    const stored = await AsyncStorage.getItem(KEYS.DECKS);
    return stored ? JSON.parse(stored) : [];
};

export const saveDeck = async (deck: Deck) => {
    const decks = await getDecks();
    const existingIndex = decks.findIndex(d => d.id === deck.id);
    
    const masteredCount = deck.cards.filter(c => c.mastered).length;
    deck.masteryPercentage = Math.round((masteredCount / deck.cards.length) * 100) || 0;
    deck.lastStudied = Date.now();

    if (existingIndex >= 0) {
        decks[existingIndex] = deck;
    } else {
        decks.unshift(deck);
    }
    
    if (decks.length > 20) decks.pop();

    await AsyncStorage.setItem(KEYS.DECKS, JSON.stringify(decks));
};

export const deleteDeck = async (id: string) => {
    const decks = (await getDecks()).filter(d => d.id !== id);
    await AsyncStorage.setItem(KEYS.DECKS, JSON.stringify(decks));
    return decks;
};

export const getNotes = async (): Promise<Note[]> => {
    const stored = await AsyncStorage.getItem(KEYS.NOTES);
    return stored ? JSON.parse(stored) : [];
};

export const saveNote = async (note: Note) => {
    const notes = await getNotes();
    const index = notes.findIndex(n => n.id === note.id);
    if (index >= 0) {
        notes[index] = note;
    } else {
        notes.unshift(note);
    }
    await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
    return notes;
};

export const deleteNote = async (id: string) => {
    const notes = (await getNotes()).filter(n => n.id !== id);
    await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
    return notes;
};

export const getFolders = async (): Promise<Folder[]> => {
  const stored = await AsyncStorage.getItem(KEYS.FOLDERS);
  return stored ? JSON.parse(stored) : [];
};

export const saveFolder = async (folder: Folder) => {
  const folders = await getFolders();
  const index = folders.findIndex(f => f.id === folder.id);
  if (index >= 0) {
    folders[index] = folder;
  } else {
    folders.push(folder);
  }
  await AsyncStorage.setItem(KEYS.FOLDERS, JSON.stringify(folders));
  return folders;
};

export const deleteFolder = async (id: string) => {
  const folders = (await getFolders()).filter(f => f.id !== id);
  await AsyncStorage.setItem(KEYS.FOLDERS, JSON.stringify(folders));
  return folders;
};

export const getGroqUsage = async (): Promise<number> => {
  const usage = await AsyncStorage.getItem('lumina_groq_usage');
  return usage ? parseInt(usage, 10) : 0;
};

export const updateGroqUsage = async (tokens: number) => {
  const current = await getGroqUsage();
  const newUsage = current + tokens;
  if (newUsage > 2500000) {
    await AsyncStorage.setItem('lumina_groq_usage', '0');
  } else {
    await AsyncStorage.setItem('lumina_groq_usage', newUsage.toString());
  }
};

export const getTimerState = async (): Promise<any | null> => {
    const stored = await AsyncStorage.getItem(KEYS.TIMER);
    return stored ? JSON.parse(stored) : null;
};

export const saveTimerState = async (state: any) => {
    await AsyncStorage.setItem(KEYS.TIMER, JSON.stringify(state));
};

export const getTimerSettings = async (): Promise<any> => {
    const stored = await AsyncStorage.getItem(KEYS.TIMER_SETTINGS);
    const defaultSettings = {
        focus: 25,
        shortBreak: 5,
        longBreak: 15,
        autoStartBreaks: false,
        autoStartFocus: false,
        soundEnabled: true,
        alarmSound: 'default',
        volume: 0.7
    };
    return stored ? JSON.parse(stored) : defaultSettings;
};

export const saveTimerSettings = async (settings: any) => {
    await AsyncStorage.setItem(KEYS.TIMER_SETTINGS, JSON.stringify(settings));
};

export const getProfile = async (): Promise<UserProfile> => {
  const stored = await AsyncStorage.getItem(KEYS.PROFILE);
  const defaultProfile: UserProfile = {
    name: 'Student',
    email: '',
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'English',
      soundEnabled: true
    }
  };
  return stored ? JSON.parse(stored) : defaultProfile;
};

export const saveProfile = async (profile: UserProfile) => {
  await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
};

export const getStudySessions = async (): Promise<StudySession[]> => {
  const stored = await AsyncStorage.getItem(KEYS.SESSIONS);
  return stored ? JSON.parse(stored) : [];
};

export const saveStudySession = async (session: StudySession) => {
  const sessions = await getStudySessions();
  sessions.unshift(session);
  if (sessions.length > 50) sessions.pop();
  await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
};

export const clearAllData = async () => {
  const keys = Object.values(KEYS);
  for (const key of keys) {
    await AsyncStorage.removeItem(key);
  }
};
