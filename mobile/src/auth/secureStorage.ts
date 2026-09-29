import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// expo-secure-store has no web implementation; localStorage is fine for a dev/web preview.
const webStorage = {
  async getItemAsync(key: string): Promise<string | null> {
    return globalThis.localStorage?.getItem(key) ?? null;
  },
  async setItemAsync(key: string, value: string): Promise<void> {
    globalThis.localStorage?.setItem(key, value);
  },
  async deleteItemAsync(key: string): Promise<void> {
    globalThis.localStorage?.removeItem(key);
  },
};

export const secureStorage = Platform.OS === 'web' ? webStorage : SecureStore;
