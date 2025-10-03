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
import { ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

const EditUsernameScreen: React.FC = () => {
  const { user: authUser } = useAuth();
  const { profile, updateProfile } = useProfile(authUser?.id);
  const [username, setUsername] = useState(profile?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const colorScheme: ColorSchemeName = useColorScheme();
  const isDark: boolean = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const handleBack = (): void => {
    router.back();
  };

  const handleSave = async (): Promise<void> => {
    if (!username.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Error: Please enter a username');
      } else {
        Alert.alert('Error', 'Please enter a username');
      }
      return;
    }

    if (username.trim() === profile?.name) {
      router.back();
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateProfile({ name: username.trim() });
      if (result.error) {
        if (Platform.OS === 'web') {
          window.alert(`Error: ${result.error}`);
        } else {
          Alert.alert('Error', result.error);
        }
      } else {
        if (Platform.OS === 'web') {
          window.alert('Success: Username updated successfully');
          setTimeout(() => {
            router.back();
          }, 1000);
        } else {
          Alert.alert('Success', 'Username updated successfully', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        }
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to update username');
      } else {
        Alert.alert('Error', 'Failed to update username');
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
        <Text style={styles.headerTitle}>Edit Username</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.saveButton}
          disabled={isLoading}
        >
          <Text style={[styles.saveButtonText, isLoading && styles.saveButtonTextDisabled]}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            autoFocus
            maxLength={50}
          />
          <Text style={styles.hint}>
            This is how other users will see your name
          </Text>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#E5E7EB' : '#111827',
    marginBottom: 8,
  },
  input: {
    backgroundColor: isDark ? '#1C1C1E' : 'white',
    borderWidth: 1,
    borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: isDark ? '#E5E7EB' : '#111827',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: isDark ? '#A1A1AA' : '#6B7280',
  },
});

export default EditUsernameScreen;
