import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY = '@streak_completions';

// Web fallback using localStorage
const webStorage = {
  async getItem(key: string): Promise<string | null> {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },
  async removeItem(key: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
};

// Use AsyncStorage for mobile, localStorage for web
const storage = Platform.OS === 'web' ? webStorage : AsyncStorage;

export const getCompletions = async (): Promise<string[]> => {
  try {
    const data = await storage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting completions:', error);
    return [];
  }
};

export const saveCompletions = async (completions: string[]): Promise<void> => {
  try {
    await storage.setItem(STORAGE_KEY, JSON.stringify(completions));
  } catch (error) {
    console.error('Error saving completions:', error);
    throw error;
  }
};

export const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};
