import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from 'react-native';
import { ArrowLeft, Mail } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = createStyles(isDark);

  const handleResetPassword = async () => {
    if (!email) {
      if (Platform.OS === 'web') {
        window.alert('Error: Please enter your email address');
      } else {
        Alert.alert('Error', 'Please enter your email address');
      }
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        const errorMessage = `Error: ${error.message}`;
        if (Platform.OS === 'web') {
          window.alert(errorMessage);
        } else {
          Alert.alert('Error', error.message);
        }
      } else {
        setEmailSent(true);
      }
    } catch (error) {
      const errorMessage = 'An unexpected error occurred';
      if (Platform.OS === 'web') {
        window.alert(`Error: ${errorMessage}`);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>

          <View style={styles.successContainer}>
            <View style={styles.iconContainer}>
              <Mail size={64} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successMessage}>
              We've sent a password reset link to {email}. Please check your inbox and follow the instructions to reset your password.
            </Text>
            
            <TouchableOpacity
              style={styles.backToSignInButton}
              onPress={() => router.push('/(auth)/sign-in')}
            >
              <Text style={styles.backToSignInButtonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.resetButton, loading && styles.disabledButton]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text style={styles.resetButtonText}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backToSignIn}
                onPress={() => router.push('/(auth)/sign-in')}
              >
                <Text style={styles.backToSignInText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#fff',
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 80,
    },
    backButton: {
      position: 'absolute',
      top: 20,
      left: 20,
      zIndex: 1,
      padding: 8,
    },
    formContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? '#999' : '#666',
      marginBottom: 40,
      textAlign: 'center',
      lineHeight: 24,
    },
    form: {
      gap: 24,
    },
    inputContainer: {
      gap: 8,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#ddd',
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      backgroundColor: isDark ? '#111' : '#f8f8f8',
      color: isDark ? '#fff' : '#000',
    },
    resetButton: {
      backgroundColor: '#007AFF',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    disabledButton: {
      opacity: 0.6,
    },
    resetButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    backToSignIn: {
      alignItems: 'center',
    },
    backToSignInText: {
      color: '#007AFF',
      fontSize: 14,
      fontWeight: '600',
    },
    successContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    iconContainer: {
      marginBottom: 24,
      padding: 20,
      backgroundColor: isDark ? '#111' : '#f8f8f8',
      borderRadius: 50,
    },
    successTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
      marginBottom: 16,
      textAlign: 'center',
    },
    successMessage: {
      fontSize: 16,
      color: isDark ? '#999' : '#666',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    backToSignInButton: {
      backgroundColor: '#007AFF',
      borderRadius: 12,
      padding: 16,
      paddingHorizontal: 32,
    },
    backToSignInButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });
}
