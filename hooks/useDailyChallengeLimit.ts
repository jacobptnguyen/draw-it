import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';

const DAILY_CHALLENGE_REFRESH_LIMIT = 1;
const CHALLENGE_REFRESH_KEY = 'daily_challenge_refresh_count';
const LAST_CHALLENGE_RESET_KEY = 'last_challenge_reset_date';

export const useDailyChallengeLimit = () => {
  const { user: authUser } = useAuth();
  const [dailyRefreshCount, setDailyRefreshCount] = useState(0);
  const [canRefreshChallenge, setCanRefreshChallenge] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const loadRefreshCount = async () => {
    if (!authUser?.id) {
      setDailyRefreshCount(0);
      setCanRefreshChallenge(false);
      return;
    }

    setIsLoading(true);
    try {
      const today = getTodayString();
      const lastReset = await AsyncStorage.getItem(LAST_CHALLENGE_RESET_KEY);
      
      // If it's a new day, reset the count
      if (lastReset !== today) {
        await AsyncStorage.setItem(LAST_CHALLENGE_RESET_KEY, today);
        await AsyncStorage.setItem(CHALLENGE_REFRESH_KEY, '0');
        setDailyRefreshCount(0);
        setCanRefreshChallenge(true);
      } else {
        // Load the stored count for today
        const storedCount = await AsyncStorage.getItem(CHALLENGE_REFRESH_KEY);
        const count = storedCount ? parseInt(storedCount, 10) : 0;
        setDailyRefreshCount(count);
        setCanRefreshChallenge(count < DAILY_CHALLENGE_REFRESH_LIMIT);
      }
    } catch (error) {
      console.error('Error loading daily challenge refresh count:', error);
      setDailyRefreshCount(0);
      setCanRefreshChallenge(false);
    } finally {
      setIsLoading(false);
    }
  };

  const incrementRefreshCount = async () => {
    try {
      const newCount = dailyRefreshCount + 1;
      await AsyncStorage.setItem(CHALLENGE_REFRESH_KEY, newCount.toString());
      setDailyRefreshCount(newCount);
      setCanRefreshChallenge(newCount < DAILY_CHALLENGE_REFRESH_LIMIT);
    } catch (error) {
      console.error('Error incrementing challenge refresh count:', error);
    }
  };

  const resetDailyCount = async () => {
    try {
      const today = getTodayString();
      await AsyncStorage.setItem(LAST_CHALLENGE_RESET_KEY, today);
      await AsyncStorage.setItem(CHALLENGE_REFRESH_KEY, '0');
      setDailyRefreshCount(0);
      setCanRefreshChallenge(true);
    } catch (error) {
      console.error('Error resetting daily challenge count:', error);
    }
  };

  // Load refresh count when user changes or component mounts
  useEffect(() => {
    loadRefreshCount();
  }, [authUser?.id]);

  // Check for day change every minute
  useEffect(() => {
    const checkDayChange = async () => {
      const today = getTodayString();
      const lastReset = await AsyncStorage.getItem(LAST_CHALLENGE_RESET_KEY);
      
      if (lastReset !== today) {
        await resetDailyCount();
      }
    };

    const interval = setInterval(checkDayChange, 60000); // Check every minute
    checkDayChange(); // Check immediately

    return () => clearInterval(interval);
  }, []);

  return {
    dailyRefreshCount,
    dailyRefreshLimit: DAILY_CHALLENGE_REFRESH_LIMIT,
    canRefreshChallenge,
    isLoading,
    incrementRefreshCount,
    checkRefreshCount: loadRefreshCount,
    remainingRefreshes: Math.max(0, DAILY_CHALLENGE_REFRESH_LIMIT - dailyRefreshCount),
  };
};
