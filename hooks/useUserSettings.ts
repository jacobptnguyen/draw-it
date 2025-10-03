import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface UserSettings {
  id?: string;
  user_id: string;
  display_name?: string;
  daily_challenge_reminder: boolean;
  reminder_time?: string;
  dark_mode: boolean;
  ai_feedback_style: 'encouraging' | 'technical' | 'balanced';
  focus_areas: string[];
  created_at?: string;
  updated_at?: string;
}

const defaultSettings: Omit<UserSettings, 'user_id'> = {
  daily_challenge_reminder: true,
  reminder_time: '09:00',
  dark_mode: false,
  ai_feedback_style: 'balanced',
  focus_areas: ['proportions', 'shading'],
};

export const useUserSettings = (userId?: string) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUserSettings();
    }
  }, [userId]);

  const loadUserSettings = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings if none exist
        const defaultUserSettings = { ...defaultSettings, user_id: userId };
        await createUserSettings(defaultUserSettings);
        setSettings(defaultUserSettings);
      }
    } catch (err) {
      console.error('Error loading user settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const createUserSettings = async (userSettings: UserSettings) => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          ...userSettings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating user settings:', err);
      throw err;
    }
  };

  const updateUserSettings = async (updates: Partial<UserSettings>) => {
    if (!userId || !settings) return;

    try {
      const updatedSettings = {
        ...settings,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_settings')
        .update(updatedSettings)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      
      setSettings(data);
      return data;
    } catch (err) {
      console.error('Error updating user settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    try {
      await updateUserSettings({ [key]: value });
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
    }
  };

  return {
    settings,
    loading,
    error,
    updateUserSettings,
    updateSetting,
    refreshSettings: loadUserSettings,
  };
};
