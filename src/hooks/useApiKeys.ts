import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

export interface ApiKeys {
  openai?: string;
  anthropic?: string;
  gemini?: string;
  deepseek?: string;
}

const API_KEYS_STORAGE_KEY = 'user_api_keys';

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const { value } = await Preferences.get({ key: API_KEYS_STORAGE_KEY });
      if (value) {
        setApiKeys(JSON.parse(value));
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApiKey = async (provider: keyof ApiKeys, key: string) => {
    try {
      const updated = { ...apiKeys, [provider]: key };
      await Preferences.set({
        key: API_KEYS_STORAGE_KEY,
        value: JSON.stringify(updated),
      });
      setApiKeys(updated);
    } catch (error) {
      console.error('Failed to save API key:', error);
      throw error;
    }
  };

  const removeApiKey = async (provider: keyof ApiKeys) => {
    try {
      const updated = { ...apiKeys };
      delete updated[provider];
      await Preferences.set({
        key: API_KEYS_STORAGE_KEY,
        value: JSON.stringify(updated),
      });
      setApiKeys(updated);
    } catch (error) {
      console.error('Failed to remove API key:', error);
      throw error;
    }
  };

  const clearAllApiKeys = async () => {
    try {
      await Preferences.remove({ key: API_KEYS_STORAGE_KEY });
      setApiKeys({});
    } catch (error) {
      console.error('Failed to clear API keys:', error);
      throw error;
    }
  };

  return {
    apiKeys,
    loading,
    updateApiKey,
    removeApiKey,
    clearAllApiKeys,
  };
};
