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
import { Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react-native';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = createStyles(isDark);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    };
  };

  const passwordValidation = validatePassword(password);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      if (Platform.OS === 'web') {
        window.alert('Error: Please fill in all fields');
      } else {
        Alert.alert('Error', 'Please fill in all fields');
      }
      return;
    }

    if (password !== confirmPassword) {
      if (Platform.OS === 'web') {
        window.alert('Error: Passwords do not match');
      } else {
        Alert.alert('Error', 'Passwords do not match');
      }
      return;
    }

    if (!passwordValidation.isValid) {
      if (Platform.OS === 'web') {
        window.alert('Error: Password does not meet requirements');
      } else {
        Alert.alert('Error', 'Password does not meet requirements');
      }
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        const errorMessage = `Error: ${error.message}`;
        if (Platform.OS === 'web') {
          window.alert(errorMessage);
        } else {
          Alert.alert('Error', error.message);
        }
      } else {
        if (Platform.OS === 'web') {
          window.alert('Success!\n\nAccount created successfully! Please check your email to verify your account.');
          // Navigate to sign-in after a brief delay
          setTimeout(() => {
            router.push('/(auth)/sign-in');
          }, 1000);
        } else {
          Alert.alert(
            'Success',
            'Account created successfully! Please check your email to verify your account.',
            [
              {
                text: 'OK',
                onPress: () => router.push('/(auth)/sign-in'),
              },
            ]
          );
        }
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

  const renderPasswordRequirement = (isValid: boolean, text: string) => (
    <View style={styles.requirementRow}>
      <CheckCircle
        size={16}
        color={isValid ? '#4CAF50' : isDark ? '#666' : '#999'}
      />
      <Text
        style={[
          styles.requirementText,
          { color: isValid ? '#4CAF50' : isDark ? '#666' : '#999' },
        ]}
      >
        {text}
      </Text>
    </View>
  );

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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Draw It! and start your artistic journey
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

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a password"
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

                <View style={styles.passwordRequirements}>
                  <Text style={styles.requirementsTitle}>Password Requirements:</Text>
                  {renderPasswordRequirement(passwordValidation.minLength, 'At least 8 characters')}
                  {renderPasswordRequirement(passwordValidation.hasUpperCase, 'One uppercase letter')}
                  {renderPasswordRequirement(passwordValidation.hasLowerCase, 'One lowercase letter')}
                  {renderPasswordRequirement(passwordValidation.hasNumbers, 'One number')}
                  {renderPasswordRequirement(passwordValidation.hasSpecialChar, 'One special character')}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor={isDark ? '#666' : '#999'}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={isDark ? '#666' : '#999'} />
                    ) : (
                      <Eye size={20} color={isDark ? '#666' : '#999'} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.signUpButton, loading && styles.disabledButton]}
                onPress={handleSignUp}
                disabled={loading}
              >
                <Text style={styles.signUpButtonText}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Text>
              </TouchableOpacity>

              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
                  <Text style={styles.signInLink}>Sign In</Text>
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
      paddingTop: 60,
      justifyContent: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
      marginBottom: 6,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? '#999' : '#666',
      marginBottom: 24,
      textAlign: 'center',
    },
    form: {
      gap: 14,
    },
    inputContainer: {
      gap: 6,
    },
    label: {
      fontSize: 15,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#ddd',
      borderRadius: 10,
      padding: 12,
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
      borderRadius: 10,
      padding: 12,
      paddingRight: 44,
      fontSize: 16,
      backgroundColor: isDark ? '#111' : '#f8f8f8',
      color: isDark ? '#fff' : '#000',
    },
    eyeButton: {
      position: 'absolute',
      right: 12,
      top: 12,
    },
    passwordRequirements: {
      marginTop: 8,
      padding: 12,
      backgroundColor: isDark ? '#111' : '#f8f8f8',
      borderRadius: 8,
      gap: 6,
    },
    requirementsTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
      marginBottom: 2,
    },
    requirementRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    requirementText: {
      fontSize: 11,
    },
    signUpButton: {
      backgroundColor: '#007AFF',
      borderRadius: 10,
      padding: 13,
      alignItems: 'center',
      marginTop: 6,
    },
    disabledButton: {
      opacity: 0.6,
    },
    signUpButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    signInContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 12,
    },
    signInText: {
      color: isDark ? '#999' : '#666',
      fontSize: 14,
    },
    signInLink: {
      color: '#007AFF',
      fontSize: 14,
      fontWeight: '600',
    },
  });
}
