import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAILY_MESSAGE_LIMIT = 10;
const MESSAGE_COUNT_KEY = 'daily_message_count';
const LAST_RESET_KEY = 'last_reset_date';

export const useRateLimit = () => {
  const { user: authUser } = useAuth();
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [canSendMessage, setCanSendMessage] = useState(true);

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const loadMessageCount = async () => {
    if (!authUser?.id) {
      setDailyMessageCount(0);
      setCanSendMessage(false);
      return;
    }

    setIsLoading(true);
    try {
      const today = getTodayString();
      const lastReset = await AsyncStorage.getItem(LAST_RESET_KEY);
      
      // If it's a new day, reset the count
      if (lastReset !== today) {
        await AsyncStorage.setItem(LAST_RESET_KEY, today);
        await AsyncStorage.setItem(MESSAGE_COUNT_KEY, '0');
        setDailyMessageCount(0);
        setCanSendMessage(true);
      } else {
        // Load the stored count for today
        const storedCount = await AsyncStorage.getItem(MESSAGE_COUNT_KEY);
        const count = storedCount ? parseInt(storedCount, 10) : 0;
        setDailyMessageCount(count);
        setCanSendMessage(count < DAILY_MESSAGE_LIMIT);
      }
    } catch (error) {
      console.error('Error loading message count:', error);
      setDailyMessageCount(0);
      setCanSendMessage(false);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementMessageCount = async () => {
    try {
      const newCount = dailyMessageCount + 1;
      await AsyncStorage.setItem(MESSAGE_COUNT_KEY, newCount.toString());
      setDailyMessageCount(newCount);
      setCanSendMessage(newCount < DAILY_MESSAGE_LIMIT);
    } catch (error) {
      console.error('Error incrementing message count:', error);
    }
  };

  const resetDailyCount = async () => {
    try {
      const today = getTodayString();
      await AsyncStorage.setItem(LAST_RESET_KEY, today);
      await AsyncStorage.setItem(MESSAGE_COUNT_KEY, '0');
      setDailyMessageCount(0);
      setCanSendMessage(true);
    } catch (error) {
      console.error('Error resetting daily count:', error);
    }
  };

  // Load message count when user changes or component mounts
  useEffect(() => {
    loadMessageCount();
  }, [authUser?.id]);

  // Check for day change every minute
  useEffect(() => {
    const checkDayChange = async () => {
      const today = getTodayString();
      const lastReset = await AsyncStorage.getItem(LAST_RESET_KEY);
      
      if (lastReset !== today) {
        await resetDailyCount();
      }
    };

    const interval = setInterval(checkDayChange, 60000); // Check every minute
    checkDayChange(); // Check immediately

    return () => clearInterval(interval);
  }, []);

  return {
    dailyMessageCount,
    dailyMessageLimit: DAILY_MESSAGE_LIMIT,
    canSendMessage,
    isLoading,
    incrementMessageCount,
    checkDailyMessageCount: loadMessageCount,
    remainingMessages: Math.max(0, DAILY_MESSAGE_LIMIT - dailyMessageCount),
  };
};
