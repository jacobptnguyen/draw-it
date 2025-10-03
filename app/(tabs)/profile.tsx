import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Modal,
  ColorSchemeName,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar,
  Trophy,
  ChevronRight,
  Flame,
  Settings,
  LogOut,
  Lock,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useBadges } from '@/hooks/useBadges';
import { Badge, Profile, AuthContext } from '@/types';

const getBadgeCardShadowStyles = (isDark: boolean) => {
  const shadowOpacity = isDark ? 0.3 : 0.1;

  return {
    boxShadow: `0px 1px 2px rgba(0, 0, 0, ${shadowOpacity})`,
  };
};

const ProfileTab: React.FC = () => {
  const { user: authUser, signOut }: AuthContext = useAuth();
  const { profile, loading: profileLoading }: { 
    profile: Profile | null; 
    loading: boolean; 
  } = useProfile(authUser?.id);
  const { badges, getEarnedBadges, loading: badgesLoading }: {
    badges: Badge[];
    getEarnedBadges: () => Badge[];
    loading: boolean;
  } = useBadges(authUser?.id);
  
  const [isSignOutModalVisible, setSignOutModalVisible] = useState(false);

  const colorScheme: ColorSchemeName = useColorScheme();
  const isDark: boolean = colorScheme === 'dark';
  const styles = createStyles(isDark);
  const earnedBadges: Badge[] = getEarnedBadges();
  const previewBadges = badges.slice(0, 3);

  const handleSignOut = (): void => {
    setSignOutModalVisible(true);
  };
  
  const confirmSignOut = (): void => {
    setSignOutModalVisible(false);
    signOut();
  };
  
  const cancelSignOut = (): void => {
    setSignOutModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            {profile?.profile_picture_url ? (
              <Image 
                source={{ uri: profile.profile_picture_url }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {profile?.name?.charAt(0) || 'U'}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{profile?.name || 'User'}</Text>
              {profile?.pro_status && (
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              )}
            </View>
            <Text style={styles.userEmail}>{authUser?.email || ''}</Text>
            <Text style={styles.memberSince}>
              Member since {profile?.created_at 
                ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  }) 
                : 'recently'}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => router.push('/settings')} 
            style={styles.settingsButton}
          >
            <Settings size={32} {...({ color: isDark ? '#E5E7EB' : '#1F2937' } as any)} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Streak Section */}
        <View style={styles.section}>
          <View style={styles.streakCard}>
            <View style={styles.streakIconContainer}>
              <Flame size={24} {...({ color: "#F97316", fill: "#F97316" } as any)} />
            </View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakTitle}>Current Streak</Text>
              <Text style={styles.streakCount}>{profile?.current_streak || 0} days</Text>
            </View>
          </View>
        </View>
        
        {/* Achievements Coming Soon */}
        <View style={styles.section}>
          <View style={styles.achievementsComingSoonCard}>
            <Text style={styles.achievementsComingSoonText}>Achievements coming soon</Text>
          </View>
        </View>
        
        {/* Sign Out Button */}
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <LogOut size={20} {...({ color: "#EF4444" } as any)} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 0.1.0</Text>
        </View>
      </ScrollView>
      
      {/* Sign Out Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isSignOutModalVisible}
        onRequestClose={cancelSignOut}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalText}>Are you sure you want to sign out?</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.buttonCancel]}
                onPress={cancelSignOut}
              >
                <Text style={[styles.textStyle, styles.textCancel]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.buttonSignOut]}
                onPress={confirmSignOut}
              >
                <Text style={[styles.textStyle, styles.textSignOut]}>Sign Out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : '#F9FAFB',
    paddingHorizontal: Platform.OS === 'web' ? 40 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#2D3748' : '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: isDark ? '#2D3748' : '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#E5E7EB' : '#6B7280',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#F3F4F6' : '#111827',
    marginRight: 8,
  },
  proBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    color: '#1F2937',
    fontSize: 12,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 14,
    color: isDark ? '#9CA3AF' : '#6B7280',
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    color: isDark ? '#6B7280' : '#9CA3AF',
  },
  headerActions: {
    marginTop: 0,
  },
  settingsButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
  },
  content: {
    flex: 1,
    paddingBottom: 120,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#F3F4F6' : '#111827',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: isDark ? '#9CA3AF' : '#6B7280',
    marginRight: 4,
  },
  streakCard: {
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: `0px 2px 8px rgba(0, 0, 0, ${isDark ? 0.3 : 0.1})`,
  },
  streakIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: isDark ? '#1E293B' : '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 14,
    color: isDark ? '#9CA3AF' : '#6B7280',
    marginBottom: 4,
  },
  streakCount: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#F3F4F6' : '#111827',
  },
  achievementsComingSoonCard: {
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    boxShadow: `0px 2px 8px rgba(0, 0, 0, ${isDark ? 0.3 : 0.1})`,
  },
  achievementsComingSoonText: {
    fontSize: 16,
    fontWeight: '500',
    color: isDark ? '#9CA3AF' : '#6B7280',
    textAlign: 'center',
  },
  achievementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  badgeCard: {
    flex: 1,
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  lockedBadgeCard: {
    opacity: 0.7,
  },
  badgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: isDark ? '#E5E7EB' : '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: 10,
    color: isDark ? '#A1A1AA' : '#6B7280',
    textAlign: 'center',
    lineHeight: 12,
  },
  lockedText: {
    color: isDark ? '#6B7280' : '#9CA3AF',
  },
  lockedDescription: {
    fontSize: 9,
    color: isDark ? '#6B7280' : '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: isDark ? '#1F2937' : '#FEE2E2',
    borderRadius: 8,
    marginHorizontal: 20,
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  versionText: {
    fontSize: 12,
    color: isDark ? '#6B7280' : '#9CA3AF',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
    modalView: {
      margin: 20,
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
      boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
    },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#F3F4F6' : '#111827',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: isDark ? '#A1A1AA' : '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: isDark ? '#374151' : '#E5E7EB',
  },
  buttonSignOut: {
    backgroundColor: '#EF4444',
  },
  textStyle: {
    fontWeight: '600',
    fontSize: 14,
  },
  textCancel: {
    color: isDark ? '#D1D5DB' : '#374151',
  },
  textSignOut: {
    color: '#FFFFFF',
  },
});

export default ProfileTab;
