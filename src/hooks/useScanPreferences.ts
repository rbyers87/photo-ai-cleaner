import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';

export interface ScanPreferences {
  scanScreenshots: boolean;
  scanBlurry: boolean;
  scanDuplicates: boolean;
  scanNoPeople: boolean;
}

const DEFAULT_PREFERENCES: ScanPreferences = {
  scanScreenshots: true,
  scanBlurry: true,
  scanDuplicates: true,
  scanNoPeople: false,
};

const PREFERENCES_KEY = 'scan_preferences';

export const useScanPreferences = () => {
  const [preferences, setPreferences] = useState<ScanPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { value } = await Preferences.get({ key: PREFERENCES_KEY });
      if (value) {
        setPreferences(JSON.parse(value));
      }
    } catch (error) {
      console.error('Failed to load scan preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<ScanPreferences>) => {
    try {
      const updated = { ...preferences, ...newPreferences };
      await Preferences.set({
        key: PREFERENCES_KEY,
        value: JSON.stringify(updated),
      });
      setPreferences(updated);
    } catch (error) {
      console.error('Failed to save scan preferences:', error);
    }
  };

  return {
    preferences,
    updatePreferences,
    loading,
  };
};
