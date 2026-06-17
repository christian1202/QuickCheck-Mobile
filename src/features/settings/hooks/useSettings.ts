import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Settings {
  atRiskThreshold: number;
  consecutiveAbsence: number;
}

const DEFAULT_SETTINGS: Settings = {
  atRiskThreshold: 70,
  consecutiveAbsence: 3,
};

export const useSettings = () => {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const atRiskStr = await AsyncStorage.getItem('quickcheck_at_risk_threshold');
      const consecutiveStr = await AsyncStorage.getItem('quickcheck_consecutive_absence');
      
      setSettingsState({
        atRiskThreshold: atRiskStr ? parseInt(atRiskStr, 10) : DEFAULT_SETTINGS.atRiskThreshold,
        consecutiveAbsence: consecutiveStr ? parseInt(consecutiveStr, 10) : DEFAULT_SETTINGS.consecutiveAbsence,
      });
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const setSettings = useCallback(async (newSettings: Partial<Settings>) => {
    try {
      const merged = { ...settings, ...newSettings };
      setSettingsState(merged);
      
      if (newSettings.atRiskThreshold !== undefined) {
        await AsyncStorage.setItem('quickcheck_at_risk_threshold', newSettings.atRiskThreshold.toString());
      }
      if (newSettings.consecutiveAbsence !== undefined) {
        await AsyncStorage.setItem('quickcheck_consecutive_absence', newSettings.consecutiveAbsence.toString());
      }
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  }, [settings]);

  return {
    settings,
    setSettings,
    isLoading,
    refreshSettings: fetchSettings,
  };
};
