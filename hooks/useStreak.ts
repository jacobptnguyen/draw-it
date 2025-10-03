import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from './useProfile';

export function useStreak(userId?: string) {
  const { profile, updateProfile } = useProfile(userId);
  const [isUpdating, setIsUpdating] = useState(false);

  const checkAndUpdateStreak = async () => {
    if (!userId || !profile) return;

    try {
      setIsUpdating(true);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Check if user has uploaded a daily challenge today
      const { data: todayUploads, error: uploadError } = await supabase
        .from('drawings')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('is_daily_challenge', true)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      if (uploadError) {
        console.error('Error checking today\'s uploads:', uploadError);
        return;
      }

      const hasUploadedToday = todayUploads && todayUploads.length > 0;
      
      // Get the last streak update date
      const lastStreakUpdate = profile.last_streak_update || profile.created_at;
      const lastUpdateDate = new Date(lastStreakUpdate).toISOString().split('T')[0];
      
      // Calculate days since last update
      const daysSinceLastUpdate = Math.floor(
        (new Date(today).getTime() - new Date(lastUpdateDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      let newStreak = profile.current_streak || 0;
      let newLongestStreak = profile.longest_streak || 0;

      if (hasUploadedToday) {
        // User uploaded today, increment streak
        if (daysSinceLastUpdate === 0) {
          // Same day, no change needed
        } else if (daysSinceLastUpdate === 1) {
          // Consecutive day, increment streak
          newStreak += 1;
          newLongestStreak = Math.max(newLongestStreak, newStreak);
        } else {
          // Gap in days, reset streak to 1
          newStreak = 1;
          newLongestStreak = Math.max(newLongestStreak, newStreak);
        }
      } else {
        // User didn't upload today
        if (daysSinceLastUpdate > 0) {
          // Reset streak if it's been more than a day
          newStreak = 0;
        }
      }

      // Update profile if streak changed
      if (newStreak !== profile.current_streak || newLongestStreak !== profile.longest_streak) {
        await updateProfile({
          current_streak: newStreak,
          longest_streak: newLongestStreak,
          last_streak_update: today,
        });
      }

    } catch (error) {
      console.error('Error updating streak:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const incrementStreak = async () => {
    if (!userId || !profile) return;

    try {
      setIsUpdating(true);
      
      const today = new Date().toISOString().split('T')[0];
      const lastStreakUpdate = profile.last_streak_update || profile.created_at;
      const lastUpdateDate = new Date(lastStreakUpdate).toISOString().split('T')[0];
      
      const daysSinceLastUpdate = Math.floor(
        (new Date(today).getTime() - new Date(lastUpdateDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      let newStreak = profile.current_streak || 0;
      let newLongestStreak = profile.longest_streak || 0;

      if (daysSinceLastUpdate === 0) {
        // Same day, no change needed
      } else if (daysSinceLastUpdate === 1) {
        // Consecutive day, increment streak
        newStreak += 1;
        newLongestStreak = Math.max(newLongestStreak, newStreak);
      } else {
        // Gap in days, reset streak to 1
        newStreak = 1;
        newLongestStreak = Math.max(newLongestStreak, newStreak);
      }

      await updateProfile({
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_streak_update: today,
      });

    } catch (error) {
      console.error('Error incrementing streak:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const resetStreak = async () => {
    if (!userId || !profile) return;

    try {
      setIsUpdating(true);
      
      const today = new Date().toISOString().split('T')[0];
      
      await updateProfile({
        current_streak: 0,
        last_streak_update: today,
      });

    } catch (error) {
      console.error('Error resetting streak:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Check streak on mount
  useEffect(() => {
    if (userId && profile) {
      checkAndUpdateStreak();
    }
  }, [userId, profile?.id]);

  return {
    currentStreak: profile?.current_streak || 0,
    longestStreak: profile?.longest_streak || 0,
    isUpdating,
    incrementStreak,
    resetStreak,
    checkAndUpdateStreak,
  };
}
