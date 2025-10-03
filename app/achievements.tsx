import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  ColorSchemeName,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ChevronLeft, Trophy, Lock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useBadges } from '@/hooks/useBadges';

interface Badge {
  id: string;
  name: string;
  description?: string;
  color: string;
  unlock_condition?: string;
  date_earned?: string;
}

interface User {
  id: string;
  email?: string;
  displayName?: string;
}

const AchievementsScreen: React.FC = () => {
  const { user: authUser }: { user: User | null } = useAuth();
  const { badges, getEarnedBadges, loading }: {
    badges: Badge[];
    getEarnedBadges: () => Badge[];
    loading: boolean;
  } = useBadges(authUser?.id);

  const colorScheme: ColorSchemeName = useColorScheme();
  const isDark: boolean = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const earnedBadges: Badge[] = getEarnedBadges();
  const unlockedCount: number = earnedBadges.length;
  const totalBadges: number = badges.length;
  const progress: number = totalBadges > 0 ? Math.round((unlockedCount / totalBadges) * 100) : 0;

  const handleBack = (): void => {
    router.back();
  };

  const getShadowStyle = () =>
    Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: `0px 2px 4px rgba(0, 0, 0, ${isDark ? 0.3 : 0.1})`,
      },
    });

  const getBadgeShadowStyle = () =>
    Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: `0px 1px 2px rgba(0, 0, 0, ${isDark ? 0.3 : 0.1})`,
      },
    });

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading achievements...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={isDark ? '#E5E7EB' : '#111827'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Progress */}
        <View style={[styles.progressContainer, getShadowStyle()]}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Your Collection</Text>
            <Text style={styles.progressCount}>
              {unlockedCount}/{totalBadges} Unlocked
            </Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progress}%` },
              ]}
            />
          </View>

          <Text style={styles.progressText}>
            {progress}% Complete
          </Text>
        </View>

        {/* Badges Grid */}
        <View style={styles.badgesContainer}>
          {badges.map((badge: Badge, index: number) => {
            const isUnlocked: boolean = earnedBadges.some((b: Badge) => b.id === badge.id);

            return (
              <View
                key={badge.id || index}
                style={[
                  styles.badgeCard,
                  !isUnlocked && styles.lockedBadgeCard,
                  getBadgeShadowStyle(),
                ]}
              >
                <View
                  style={[
                    styles.badgeIconContainer,
                    {
                      backgroundColor: isUnlocked
                        ? `${badge.color}20`
                        : (isDark ? '#2D3748' : '#F3F4F6'),
                    },
                  ]}
                >
                  {isUnlocked ? (
                    <Trophy size={32} color={badge.color} />
                  ) : (
                    <Lock size={24} color={isDark ? '#6B7280' : '#9CA3AF'} />
                  )}
                </View>

                <Text style={[styles.badgeName, !isUnlocked && styles.lockedText]}>
                  {isUnlocked ? badge.name : 'Locked'}
                </Text>

                {isUnlocked ? (
                  <Text style={styles.badgeDescription}>
                    {badge.description || 'Achievement unlocked!'}
                  </Text>
                ) : (
                  <Text style={styles.lockedDescription}>
                    {(badge.unlock_condition
                      ? badge.unlock_condition.replace(/_/g, ' ').toLowerCase()
                      : 'complete challenges to unlock')}
                  </Text>
                )}

                {isUnlocked && badge.date_earned && (
                  <Text style={styles.earnedDate}>
                    Earned on {new Date(badge.date_earned).toLocaleDateString()}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#F9FAFB',
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: isDark ? '#E5E7EB' : '#6B7280',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#2C2C2E' : '#E5E7EB',
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#E5E7EB' : '#111827',
    },
    headerRight: {
      width: 40,
    },
    scrollView: {
      flex: 1,
    },
    progressContainer: {
      margin: 20,
      padding: 20,
      backgroundColor: isDark ? '#1C1C1E' : 'white',
      borderRadius: 12,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    progressTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#E5E7EB' : '#111827',
    },
    progressCount: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#A1A1AA' : '#6B7280',
    },
    progressBarBackground: {
      height: 8,
      backgroundColor: isDark ? '#2C2C2E' : '#E5E7EB',
      borderRadius: 4,
      marginBottom: 8,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: '#8B5CF6',
      borderRadius: 4,
    },
    progressText: {
      fontSize: 14,
      color: isDark ? '#A1A1AA' : '#6B7280',
      textAlign: 'right',
    },
    badgesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 8,
      justifyContent: 'space-between',
    },
    badgeCard: {
      width: '48%',
      backgroundColor: isDark ? '#1C1C1E' : 'white',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      alignItems: 'center',
    },
    lockedBadgeCard: {
      opacity: 0.7,
    },
    badgeIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    badgeName: {
      fontSize: 15,
      fontWeight: '600',
      color: isDark ? '#E5E7EB' : '#111827',
      marginBottom: 6,
      textAlign: 'center',
    },
    badgeDescription: {
      fontSize: 12,
      color: isDark ? '#A1A1AA' : '#6B7280',
      textAlign: 'center',
      marginBottom: 4,
    },
    lockedText: {
      color: isDark ? '#6B7280' : '#9CA3AF',
    },
    lockedDescription: {
      fontSize: 11,
      color: isDark ? '#6B7280' : '#9CA3AF',
      fontStyle: 'italic',
      textAlign: 'center',
      marginBottom: 4,
    },
    earnedDate: {
      fontSize: 10,
      color: isDark ? '#6B7280' : '#9CA3AF',
      marginTop: 4,
    },
  });

export default AchievementsScreen;
