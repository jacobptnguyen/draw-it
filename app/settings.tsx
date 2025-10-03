import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  useColorScheme, 
  ScrollView,
  ColorSchemeName,
  Platform,
  useWindowDimensions,
  Keyboard, // Added Keyboard for the fix
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ChevronLeft, User, Lock, Camera, Trash2 } from 'lucide-react-native';
import { Provider } from 'react-native-paper';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Profile, AuthUser, SettingItemProps, SectionHeaderProps } from '@/types';
import ProfilePicturePicker from '@/components/ProfilePicturePicker';

const SettingsScreen: React.FC = () => {
  const { user: authUser, deleteAccount }: { user: AuthUser | null; deleteAccount: () => Promise<{ error: any }> } = useAuth();
  const { profile }: { profile: Profile | null } = useProfile(authUser?.id);
  const [showProfilePicturePicker, setShowProfilePicturePicker] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const colorScheme: ColorSchemeName = useColorScheme();
  const isDark: boolean = colorScheme === 'dark';
  const windowDimensions = useWindowDimensions();
  const styles = createStyles(isDark, windowDimensions.width);
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (isWeb && typeof document !== 'undefined') {
      document.body.style.backgroundColor = isDark ? '#121212' : '#F9FAFB';
    }
  }, [isDark, isWeb]);

  const handleBack = (): void => {
    router.back();
  };

  const handleProfilePicture = (): void => {
    setShowProfilePicturePicker(true);
  };

  const handleEditUsername = (): void => {
    router.push('/edit-username');
  };

  const handleChangePassword = (): void => {
    // FIX: Blur the active element/keyboard on web before navigating to prevent focus conflict
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    } else {
        Keyboard.dismiss();
    }
    router.push('/change-password');
  };

  const handleDeleteAccount = (): void => {
    console.log('Delete account button pressed');
    
    if (Platform.OS === 'web') {
      // Use window.confirm for web
      const firstConfirm = window.confirm(
        'Delete Account\n\nAre you sure you want to delete your account? This action cannot be undone and will permanently remove all your drawings, progress, and data.'
      );
      
      if (!firstConfirm) {
        console.log('First confirmation cancelled');
        return;
      }
      
      console.log('First confirmation accepted');
      
      const secondConfirm = window.confirm(
        'Final Confirmation\n\nThis is your last chance to cancel. Your account and all data will be permanently deleted.'
      );
      
      if (!secondConfirm) {
        console.log('Second confirmation cancelled');
        return;
      }
      
      console.log('Second confirmation accepted, proceeding with deletion');
      performAccountDeletion();
    } else {
      // Use Alert.alert for mobile
      Alert.alert(
        'Delete Account',
        'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your drawings, progress, and data.',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                'Final Confirmation',
                'This is your last chance to cancel. Your account and all data will be permanently deleted.',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel'
                  },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: performAccountDeletion
                  }
                ]
              );
            }
          }
        ]
      );
    }
  };

  const performAccountDeletion = async (): Promise<void> => {
    try {
      console.log('Starting account deletion...');
      setIsDeleting(true);
      
      if (!deleteAccount) {
        console.error('deleteAccount function not available');
        if (Platform.OS === 'web') {
          window.alert('Account deletion is not available. Please contact support.');
        } else {
          Alert.alert('Error', 'Account deletion is not available. Please contact support.');
        }
        return;
      }
      
      console.log('Calling deleteAccount function...');
      console.log('User ID:', authUser?.id);
      
      const result = await deleteAccount();
      console.log('Delete account result:', result);
      
      if (result?.error) {
        console.error('Delete account error:', result.error);
        const errorMessage = `Failed to delete account: ${result.error?.message || 'Unknown error'}`;
        
        if (Platform.OS === 'web') {
          window.alert(errorMessage);
        } else {
          Alert.alert('Error', errorMessage);
        }
        return;
      }

      console.log('Account deleted successfully');
      setIsDeleting(false);
      
      if (Platform.OS === 'web') {
        window.alert('Account Deleted\n\nYour account has been successfully deleted.');
        console.log('Redirecting to auth screen...');
        router.replace('/(auth)');
      } else {
        Alert.alert(
          'Account Deleted',
          'Your account has been successfully deleted.',
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('Redirecting to auth screen...');
                router.replace('/(auth)');
              }
            }
          ],
          { cancelable: false }
        );
      }
      
      // Fallback redirect for web
      if (Platform.OS === 'web') {
        setTimeout(() => {
          console.log('Fallback redirect triggered');
          router.replace('/(auth)');
        }, 1000);
      }
    } catch (error) {
      console.error('Unexpected error during deletion:', error);
      const errorMessage = `An unexpected error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      if (Platform.OS === 'web') {
        window.alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      console.log('Deletion process finished');
      setIsDeleting(false);
    }
  };

  const SettingItem: React.FC<SettingItemProps> = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement
  }) => {
    const isDangerItem = title === 'Delete Account';
    
    return (
      <TouchableOpacity
        style={styles.settingItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingLeft}>
          <View style={[
            styles.iconWrapper,
            isDangerItem && styles.dangerIconWrapper
          ]}>
            <Icon size={20} {...({ color: isDangerItem ? '#EF4444' : (isDark ? '#E5E7EB' : '#111827') } as any)} />
          </View>
          <View style={styles.settingText}>
            <Text style={[
              styles.settingTitle,
              isDangerItem && styles.dangerTitle
            ]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[
                styles.settingSubtitle,
                isDangerItem && styles.dangerSubtitle
              ]}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.settingRight}>
          {rightElement}
        </View>
      </TouchableOpacity>
    );
  };

  const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <Provider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} {...({ color: isDark ? '#E5E7EB' : '#111827' } as any)} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <SectionHeader title="Account" />
        <SettingItem
          icon={Camera}
          title="Profile Picture"
          subtitle="Change your profile picture"
          onPress={handleProfilePicture}
        />
        <SettingItem
          icon={User}
          title="Edit Username"
          subtitle={profile?.name || 'Set username'}
          onPress={handleEditUsername}
        />
        <SettingItem
          icon={Lock}
          title="Change Password"
          subtitle="Update your password"
          onPress={handleChangePassword}
        />

        {authUser?.email && (
          <>
            <SectionHeader title="Delete Account" />
            <View style={styles.dangerSection}>
              <SettingItem
                icon={Trash2}
                title="Delete Account"
                subtitle="Permanently delete your account and all data"
                onPress={handleDeleteAccount}
                rightElement={
                  isDeleting ? (
                    <Text style={styles.deletingText}>
                      Deleting...
                    </Text>
                  ) : undefined
                }
              />
            </View>
          </>
        )}

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 0.1.0</Text>
        </View>
      </ScrollView>

        <ProfilePicturePicker
          visible={showProfilePicturePicker}
          onClose={() => setShowProfilePicturePicker(false)}
        />
      </SafeAreaView>
    </Provider>
  );
};

const createStyles = (isDark: boolean, windowWidth?: number) => {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : '#F9FAFB',
    paddingHorizontal: Platform.OS === 'web' ? 40 : 0,
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
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#A1A1AA' : '#6B7280',
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#2C2C2E' : '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: isDark ? '#E5E7EB' : '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: isDark ? '#A1A1AA' : '#6B7280',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  versionContainer: {
    padding: 24,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: isDark ? '#A1A1AA' : '#6B7280',
  },
  deletingText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#EF4444',
  },
  dangerSection: {
    borderTopWidth: 1,
    borderTopColor: isDark ? '#2C2C2E' : '#F3F4F6',
  },
  dangerTitle: {
    color: '#EF4444',
  },
  dangerSubtitle: {
    color: isDark ? '#FCA5A5' : '#DC2626',
  },
  dangerIconWrapper: {
    backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2',
  },
  });
};

export default SettingsScreen;