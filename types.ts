
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  mastered: boolean;
}

export interface Deck {
  id: string;
  title: string;
  cards: Flashcard[];
  createdAt: number;
  lastStudied: number;
  masteryPercentage: number;
}

export interface UserStats {
  cardsLearnedToday: number;
  mistakesToday: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string; // ISO date string YYYY-MM-DD
  totalCardsLearned: number;
  totalMistakes: number;
  weeklyActivity: number[]; // Array of 7 numbers (Sun-Sat)
  dailyGoal: number;
  totalPoints: number;
  streak: number;
  cardsMastered: number;
  sessionsCompleted: number;
  totalStudyTime: number;
  accuracy: number;
}

export interface UserProfile {
  name: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
    soundEnabled: boolean;
  };
}

export interface StudySession {
  id: string;
  timestamp: number;
  duration: number; // in minutes
  type: string;
  points: number;
}

export interface TimerSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  soundEnabled: boolean;
  alarmSound: string;
  volume: number;
}

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface ProblemSolution {
  problem: string;
  finalAnswer: string;
  steps: {
    title: string;
    content: string;
    explanation?: string;
  }[];
  concepts: string[];
}

export type AIProvider = 'gemini' | 'groq' | 'openrouter';

export interface UserSettings {
  name: string;
  academicLevel: string;
  profileImage: string | null;
  aiProvider: AIProvider;
  geminiKey?: string;
  groqKey?: string;
  openrouterKey?: string;
  pollinationsKey?: string;
  textModel?: string;
  mediaModel?: string;
  diagramModel?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  tool?: string;
  reasoning?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  createdAt: number;
  updatedAt: number;
  folderId?: string;
  isFavorite?: boolean;
  tags?: string[];
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface DiagramData {
  title: string;
  code: string;
  explanation: string;
  type: 'flowchart' | 'mindmap' | 'sequence';
}

export interface VideoSummary {
  title: string;
  summary: string;
  keyConcepts: string[];
  transcript?: string;
}

export type ViewState = 'dashboard' | 'chat' | 'flashcards' | 'pomodoro' | 'notes' | 'progress' | 'diagrams' | 'solver' | 'settings' | 'video-tutor';

export enum StudyMode {
  Standard = 'Standard',
  ExamPrep = 'ExamPrep',
  Creative = 'Creative'
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

interface ImportMetaEnv {
  readonly VITE_POLLINATIONS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
