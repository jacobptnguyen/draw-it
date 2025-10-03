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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from 'react-native';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = createStyles(isDark);

  const handleSignIn = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message?.includes('Invalid login credentials') || 
            error.message?.includes('Invalid email or password') ||
            error.message?.includes('User not found') ||
            error.message?.includes('Wrong password')) {
          setError('Invalid email or password.');
        } else {
          setError(error.message || 'Failed to sign in');
        }
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your drawing journey
            </Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError('');
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor={isDark ? '#666' : '#999'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (error) setError('');
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={isDark ? '#666' : '#999'} />
                    ) : (
                      <Eye size={20} color={isDark ? '#666' : '#999'} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.signInButton, loading && styles.disabledButton]}
                onPress={handleSignIn}
                disabled={loading}
              >
                <Text style={styles.signInButtonText}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
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
    scrollContent: {
      flexGrow: 1,
    },
    backButton: {
      position: 'absolute',
      top: 20,
      left: 20,
      zIndex: 1,
      padding: 8,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 80,
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
    },
    form: {
      gap: 20,
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
    passwordContainer: {
      position: 'relative',
    },
    passwordInput: {
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#ddd',
      borderRadius: 12,
      padding: 16,
      paddingRight: 50,
      fontSize: 16,
      backgroundColor: isDark ? '#111' : '#f8f8f8',
      color: isDark ? '#fff' : '#000',
    },
    eyeButton: {
      position: 'absolute',
      right: 16,
      top: 16,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
    },
    forgotPasswordText: {
      color: '#007AFF',
      fontSize: 14,
    },
    errorContainer: {
      backgroundColor: isDark ? '#2D1B1B' : '#FEF2F2',
      borderWidth: 1,
      borderColor: isDark ? '#7F1D1D' : '#FECACA',
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    errorText: {
      color: isDark ? '#FCA5A5' : '#DC2626',
      fontSize: 14,
      textAlign: 'center',
      fontWeight: '500',
    },
    signInButton: {
      backgroundColor: '#007AFF',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 10,
    },
    disabledButton: {
      opacity: 0.6,
    },
    signInButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    signUpContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
    },
    signUpText: {
      color: isDark ? '#999' : '#666',
      fontSize: 14,
    },
    signUpLink: {
      color: '#007AFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });
}