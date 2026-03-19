import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getTimerState, saveTimerState } from '../services/storage';
import { saveAudio, getAudio, deleteAudio } from '../services/audioDb';

interface TimerContextType {
  timeLeft: number;
  isActive: boolean;
  mode: 'focus' | 'break';
  initialTime: number;
  focusDuration: number;
  breakDuration: number;
  cycleDuration: number;
  cycleTimeLeft: number | null;
  ringingAlarm: 'focus' | 'break' | 'cycle' | null;
  focusAlarmUrl: string | null;
  breakAlarmUrl: string | null;
  cycleAlarmUrl: string | null;
  playingPreview: 'focus' | 'break' | 'cycle' | null;
  
  setTimeLeft: (time: number) => void;
  setIsActive: (active: boolean) => void;
  setMode: (mode: 'focus' | 'break') => void;
  setFocusDuration: (duration: number) => void;
  setBreakDuration: (duration: number) => void;
  setCycleDuration: (duration: number) => void;
  setCycleTimeLeft: (time: number | null) => void;
  setFocusAlarmUrl: (url: string | null) => void;
  setBreakAlarmUrl: (url: string | null) => void;
  setCycleAlarmUrl: (url: string | null) => void;
  
  toggleTimer: () => void;
  resetTimer: () => void;
  switchMode: (newMode: 'focus' | 'break') => void;
  dismissAlarm: () => void;
  playAlarm: (type: 'focus' | 'break' | 'cycle') => void;
  stopActiveAlarm: () => void;
  previewAlarm: (url: string | null, type: 'focus' | 'break' | 'cycle') => void;
  stopPreview: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [initialTime, setInitialTime] = useState(25 * 60);
  
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [cycleDuration, setCycleDuration] = useState(0);
  const [cycleTimeLeft, setCycleTimeLeft] = useState<number | null>(null);
  
  const [focusAlarmUrl, setFocusAlarmUrl] = useState<string | null>(null);
  const [breakAlarmUrl, setBreakAlarmUrl] = useState<string | null>(null);
  const [cycleAlarmUrl, setCycleAlarmUrl] = useState<string | null>(null);
  
  const [ringingAlarm, setRingingAlarm] = useState<'focus' | 'break' | 'cycle' | null>(null);
  
  const [playingPreview, setPlayingPreview] = useState<'focus' | 'break' | 'cycle' | null>(null);
  
  // Placeholder for audio refs in React Native
  // In a real app, we would use react-native-sound or expo-av
  const audioRef = useRef<any>(null);

  const stopActiveAlarm = () => {
    // Placeholder for stopping audio in React Native
    console.log("Stopping active alarm");
  };

  const stopPreview = () => {
    // Placeholder for stopping preview in React Native
    console.log("Stopping preview");
    setPlayingPreview(null);
  };

  const playAlarm = (type: 'focus' | 'break' | 'cycle') => {
    stopActiveAlarm();
    console.log(`Playing alarm: ${type}`);
    // In a real app, we would use react-native-sound or expo-av
  };

  const previewAlarm = (url: string | null, type: 'focus' | 'break' | 'cycle') => {
    if (playingPreview === type) {
      stopPreview();
      return;
    }
    
    stopPreview();
    setPlayingPreview(type);
    console.log(`Previewing alarm: ${type} at ${url}`);
    
    setTimeout(() => {
      stopPreview();
    }, 4000);
  };

  useEffect(() => {
    const loadState = async () => {
      const saved = await getTimerState();
      
      // Load audio from storage
      setFocusAlarmUrl(await getAudio('focusAlarmUrl'));
      setBreakAlarmUrl(await getAudio('breakAlarmUrl'));
      setCycleAlarmUrl(await getAudio('cycleAlarmUrl'));

      if (saved) {
        setMode(saved.mode);
        setFocusDuration(saved.focusDuration || 25);
        setBreakDuration(saved.breakDuration || 5);
        setCycleDuration(saved.cycleDuration || 0);
        
        const currentInitialTime = saved.mode === 'focus' ? (saved.focusDuration || 25) * 60 : (saved.breakDuration || 5) * 60;
        setInitialTime(currentInitialTime);

        const now = Date.now();
        if (saved.isActive && saved.targetTimestamp) {
          const diff = Math.floor((saved.targetTimestamp - now) / 1000);
          if (diff > 0) {
            setTimeLeft(diff);
            setIsActive(true);
          } else {
            setTimeLeft(0);
            setIsActive(false);
          }

          if (saved.cycleTargetTimestamp) {
            const cycleDiff = Math.floor((saved.cycleTargetTimestamp - now) / 1000);
            if (cycleDiff > 0) {
              setCycleTimeLeft(cycleDiff);
            } else {
              setCycleTimeLeft(0);
            }
          } else {
            setCycleTimeLeft(saved.cycleTimeLeft !== undefined ? saved.cycleTimeLeft : null);
          }
        } else {
          setTimeLeft(saved.timeLeft);
          setIsActive(false);
          setCycleTimeLeft(saved.cycleTimeLeft !== undefined ? saved.cycleTimeLeft : null);
        }
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    const state = {
      mode,
      timeLeft,
      isActive,
      targetTimestamp: isActive ? Date.now() + (timeLeft * 1000) : null,
      lastUpdated: Date.now(),
      focusDuration,
      breakDuration,
      cycleDuration,
      cycleTimeLeft,
      cycleTargetTimestamp: (isActive && cycleTimeLeft !== null) ? Date.now() + (cycleTimeLeft * 1000) : null,
      focusAlarmUrl: null,
      breakAlarmUrl: null,
      cycleAlarmUrl: null
    };
    saveTimerState(state);
  }, [mode, timeLeft, isActive, focusDuration, breakDuration, cycleDuration, cycleTimeLeft]);

  useEffect(() => {
    if (focusAlarmUrl) {
      saveAudio('focusAlarmUrl', focusAlarmUrl);
    } else {
      deleteAudio('focusAlarmUrl');
    }
  }, [focusAlarmUrl]);

  useEffect(() => {
    if (breakAlarmUrl) {
      saveAudio('breakAlarmUrl', breakAlarmUrl);
    } else {
      deleteAudio('breakAlarmUrl');
    }
  }, [breakAlarmUrl]);

  useEffect(() => {
    if (cycleAlarmUrl) {
      saveAudio('cycleAlarmUrl', cycleAlarmUrl);
    } else {
      deleteAudio('cycleAlarmUrl');
    }
  }, [cycleAlarmUrl]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (cycleTimeLeft !== null && cycleTimeLeft > 0) {
          setCycleTimeLeft((prev) => (prev !== null ? prev - 1 : null));
        }
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (cycleDuration > 0 && cycleTimeLeft !== null && cycleTimeLeft <= 0) {
        playAlarm('cycle');
        setRingingAlarm('cycle');
      } else {
        playAlarm(mode);
        setRingingAlarm(mode);
      }
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, cycleDuration, cycleTimeLeft]);

  const dismissAlarm = () => {
    stopActiveAlarm();
    const finishedAlarm = ringingAlarm;
    setRingingAlarm(null);

    if (finishedAlarm === 'cycle') {
      setCycleTimeLeft(null);
      setCycleDuration(0);
      resetTimer();
    } else if (cycleDuration > 0 && cycleTimeLeft !== null && cycleTimeLeft > 0) {
      const nextMode = mode === 'focus' ? 'break' : 'focus';
      const nextTime = nextMode === 'focus' ? focusDuration * 60 : breakDuration * 60;
      setMode(nextMode);
      setInitialTime(nextTime);
      setTimeLeft(nextTime);
      setIsActive(true);
    } else {
      const nextMode = mode === 'focus' ? 'break' : 'focus';
      const nextTime = nextMode === 'focus' ? focusDuration * 60 : breakDuration * 60;
      setMode(nextMode);
      setInitialTime(nextTime);
      setTimeLeft(nextTime);
    }
  };

  const toggleTimer = () => {
    if (!isActive && cycleDuration > 0 && cycleTimeLeft === null) {
      setCycleTimeLeft(cycleDuration * 60 * 60);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    const t = mode === 'focus' ? focusDuration * 60 : breakDuration * 60;
    setInitialTime(t);
    setTimeLeft(t);
    setCycleTimeLeft(null);
  };

  const switchMode = (newMode: 'focus' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    const newTime = newMode === 'focus' ? focusDuration * 60 : breakDuration * 60;
    setInitialTime(newTime);
    setTimeLeft(newTime);
  };

  return (
    <TimerContext.Provider value={{
      timeLeft, isActive, mode, initialTime, focusDuration, breakDuration, cycleDuration, cycleTimeLeft, ringingAlarm,
      focusAlarmUrl, breakAlarmUrl, cycleAlarmUrl, playingPreview,
      setTimeLeft, setIsActive, setMode, setFocusDuration, setBreakDuration, setCycleDuration, setCycleTimeLeft,
      setFocusAlarmUrl, setBreakAlarmUrl, setCycleAlarmUrl,
      toggleTimer, resetTimer, switchMode, dismissAlarm, playAlarm, stopActiveAlarm, previewAlarm, stopPreview
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
