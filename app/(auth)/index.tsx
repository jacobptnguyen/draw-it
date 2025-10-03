import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Platform,
  useWindowDimensions,
  ScrollView, // ADD THIS
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Palette, Target, Sparkles, Users } from 'lucide-react-native';

const { width } = Dimensions.get('screen');

export default function WelcomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { signInAnonymously } = useAuth();
  const [guestLoading, setGuestLoading] = useState(false);
  const windowDimensions = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  // Set document body background color on web
  useEffect(() => {
    if (isWeb && typeof document !== 'undefined') {
      document.body.style.backgroundColor = isDark ? '#000' : '#fff';
    }
  }, [isDark, isWeb]);

  const styles = createStyles(isDark, windowDimensions.width);

  const handleGuestSignIn = async () => {
    setGuestLoading(true);
    try {
      const { error } = await signInAnonymously();
      if (error) {
        if (Platform.OS === 'web') {
          window.alert(`Error: ${error.message || 'Failed to sign in as guest'}`);
        } else {
          Alert.alert('Error', error.message || 'Failed to sign in as guest');
        }
      } else {
        // SUCCESS - Navigate to home page (tabs)
        router.replace('/(tabs)');
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Error: An unexpected error occurred');
      } else {
        Alert.alert('Error', 'An unexpected error occurred');
      }
    } finally {
      setGuestLoading(false);
    }
  };

  const features = [
    {
      icon: Palette,
      title: 'Daily Drawing Practice',
      description: 'Improve your skills with structured daily exercises',
      color: '#8B5CF6',
    },
    {
      icon: Target,
      title: 'AI-Powered Feedback',
      description: 'Get instant feedback and suggestions for improvement',
      color: '#3B82F6',
    },
    {
      icon: Sparkles,
      title: 'Powered by OpenAI',
      description: 'Built with GPT-4o and DALL-E-3 for intelligent feedback',
      color: '#10B981',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Draw It!</Text>
          <Text style={styles.subtitle}>
            Transform your artistic journey with AI-powered daily drawing practice
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                <feature.icon size={24} color="#FFFFFF" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(auth)/sign-up')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.guestButton, guestLoading && styles.disabledButton]}
            onPress={handleGuestSignIn}
            disabled={guestLoading}
          >
            <Text style={styles.guestButtonText}>
              {guestLoading ? 'Signing In...' : 'Continue as Guest'}
            </Text>
          </TouchableOpacity>

          <View style={styles.consentContainer}>
            <Text style={styles.consentText}>
              By using Draw It!, you agree to our{' '}
              <Text 
                style={styles.consentLink}
                onPress={() => router.push('/terms')}
              >
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text 
                style={styles.consentLink}
                onPress={() => router.push('/privacy')}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(isDark: boolean, windowWidth?: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: Platform.OS === 'web' ? 40 : 24,
      paddingTop: 24,
      paddingBottom: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 28,
    },
    title: {
      fontSize: 36,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
      marginBottom: 16,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? '#999' : '#666',
      textAlign: 'center',
      lineHeight: 22,
      maxWidth: width * 0.8,
    },
    featuresContainer: {
      gap: 12,
      marginBottom: 32,
    },
    featureCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#111' : '#f8f8f8',
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#e5e5e5',
    },
    featureIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
      marginBottom: 2,
    },
    featureDescription: {
      fontSize: 13,
      color: isDark ? '#999' : '#666',
      lineHeight: 18,
    },
    ctaContainer: {
      gap: 10,
      marginBottom: 20,
    },
    primaryButton: {
      backgroundColor: '#007AFF',
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
    },
    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#ddd',
    },
    secondaryButtonText: {
      color: isDark ? '#fff' : '#000',
      fontSize: 16,
      fontWeight: '500',
    },
    guestButton: {
      backgroundColor: 'transparent',
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#ddd',
      marginTop: 2,
    },
    guestButtonText: {
      color: isDark ? '#fff' : '#000',
      fontSize: 16,
      fontWeight: '500',
    },
    disabledButton: {
      opacity: 0.6,
    },
    footer: {
      alignItems: 'center',
    },
    footerText: {
      fontSize: 12,
      color: isDark ? '#666' : '#999',
      textAlign: 'center',
      lineHeight: 18,
    },
    consentContainer: {
      marginTop: 16,
      paddingHorizontal: 8,
    },
    consentText: {
      fontSize: 12,
      color: isDark ? '#666' : '#999',
      textAlign: 'center',
      lineHeight: 18,
    },
    consentLink: {
      color: '#007AFF',
      textDecorationLine: 'underline',
    },
  });
}