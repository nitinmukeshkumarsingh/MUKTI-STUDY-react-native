import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  AUDIO: 'lumina_audio_data'
};

export const saveAudio = async (key: string, url: string) => {
  const stored = await AsyncStorage.getItem(KEYS.AUDIO);
  const audioData = stored ? JSON.parse(stored) : {};
  audioData[key] = url;
  await AsyncStorage.setItem(KEYS.AUDIO, JSON.stringify(audioData));
};

export const getAudio = async (key: string): Promise<string | null> => {
  const stored = await AsyncStorage.getItem(KEYS.AUDIO);
  if (!stored) return null;
  const audioData = JSON.parse(stored);
  return audioData[key] || null;
};

export const deleteAudio = async (key: string) => {
  const stored = await AsyncStorage.getItem(KEYS.AUDIO);
  if (!stored) return;
  const audioData = JSON.parse(stored);
  delete audioData[key];
  await AsyncStorage.setItem(KEYS.AUDIO, JSON.stringify(audioData));
};
