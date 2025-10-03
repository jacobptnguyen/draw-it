import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge, UserBadge } from '@/types';

export function useBadges(userId?: string) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBadges() {
      try {
        // Fetch all available badges
        const { data: badgesData, error: badgesError } = await supabase
          .from('badges')
          .select('*')
          .order('requirement_count', { ascending: true });

        if (badgesError) throw badgesError;

        // Fetch user's earned badges if userId is provided
        let userBadgesData: UserBadge[] = [];
        if (userId) {
          const { data: userBadgesResult, error: userBadgesError } = await supabase
            .from('user_badges')
            .select('*')
            .eq('user_id', userId);

          if (userBadgesError) throw userBadgesError;
          userBadgesData = userBadgesResult || [];
        }

        setBadges(badgesData || []);
        setUserBadges(userBadgesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchBadges();
  }, [userId]);

  const earnBadge = async (badgeId: string) => {
    if (!userId) return { error: 'No user ID' };

    try {
      const { data, error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId,
        })
        .select()
        .single();

      if (error) throw error;
      
      setUserBadges(prev => [...prev, data]);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const hasBadge = (badgeId: string) => {
    return userBadges.some(ub => ub.badge_id === badgeId);
  };

  const getEarnedBadges = () => {
    return badges.filter(badge => hasBadge(badge.id));
  };

  const getUnearnedBadges = () => {
    return badges.filter(badge => !hasBadge(badge.id));
  };

  return {
    badges,
    userBadges,
    loading,
    error,
    earnBadge,
    hasBadge,
    getEarnedBadges,
    getUnearnedBadges,
  };
}
