import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  useColorScheme,
  ColorSchemeName,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

const ChangePasswordScreen: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const colorScheme: ColorSchemeName = useColorScheme();
  const isDark: boolean = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const handleBack = (): void => {
    router.back();
  };

  const handleChangePassword = async (): Promise<void> => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      if (Platform.OS === 'web') {
        window.alert('Error: Please fill in all fields');
      } else {
        Alert.alert('Error', 'Please fill in all fields');
      }
      return;
    }

    if (newPassword !== confirmPassword) {
      if (Platform.OS === 'web') {
        window.alert('Error: New passwords do not match');
      } else {
        Alert.alert('Error', 'New passwords do not match');
      }
      return;
    }

    if (newPassword.length < 6) {
      if (Platform.OS === 'web') {
        window.alert('Error: New password must be at least 6 characters long');
      } else {
        Alert.alert('Error', 'New password must be at least 6 characters long');
      }
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        if (Platform.OS === 'web') {
          window.alert(`Error: ${error.message}`);
        } else {
          Alert.alert('Error', error.message);
        }
      } else {
        if (Platform.OS === 'web') {
          window.alert('Success: Password changed successfully');
          setTimeout(() => {
            router.back();
          }, 1000);
        } else {
          Alert.alert('Success', 'Password changed successfully', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        }
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to change password');
      } else {
        Alert.alert('Error', 'Failed to change password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} {...({ color: isDark ? '#E5E7EB' : '#111827' } as any)} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <TouchableOpacity 
          onPress={handleChangePassword} 
          style={styles.saveButton}
          disabled={isLoading}
        >
          <Text style={[styles.saveButtonText, isLoading && styles.saveButtonTextDisabled]}>
            {isLoading ? 'Changing...' : 'Change'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={() => setShowCurrentPassword(!showCurrentPassword)} 
                style={styles.eyeButton}
              >
                {showCurrentPassword ? (
                  <EyeOff size={20} {...({ color: isDark ? '#A1A1AA' : '#6B7280' } as any)} />
                ) : (
                  <Eye size={20} {...({ color: isDark ? '#A1A1AA' : '#6B7280' } as any)} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={() => setShowNewPassword(!showNewPassword)} 
                style={styles.eyeButton}
              >
                {showNewPassword ? (
                  <EyeOff size={20} {...({ color: isDark ? '#A1A1AA' : '#6B7280' } as any)} />
                ) : (
                  <Eye size={20} {...({ color: isDark ? '#A1A1AA' : '#6B7280' } as any)} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                style={styles.eyeButton}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} {...({ color: isDark ? '#A1A1AA' : '#6B7280' } as any)} />
                ) : (
                  <Eye size={20} {...({ color: isDark ? '#A1A1AA' : '#6B7280' } as any)} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#121212' : '#F9FAFB',
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#000000',
  },
  saveButtonTextDisabled: {
    color: isDark ? '#6B7280' : '#9CA3AF',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#E5E7EB' : '#111827',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1C1C1E' : 'white',
    borderWidth: 1,
    borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: isDark ? '#E5E7EB' : '#111827',
  },
  eyeButton: {
    padding: 16,
  },
});

export default ChangePasswordScreen;