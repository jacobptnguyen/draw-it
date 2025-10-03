import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  useColorScheme,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import {
  ChevronLeft,
  Crown,
  Check,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

const UpgradeScreen = () => {
  const { user: authUser } = useAuth();
  const { profile } = useProfile(authUser?.id);
  const [loading, setLoading] = useState(false);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);

  const handleBack = () => {
    router.back();
  };

  const handleSubscribe = async () => {
    if (!authUser?.id) {
      if (Platform.OS === 'web') {
        window.alert('Error: Please sign in to upgrade to Pro');
      } else {
        Alert.alert('Error', 'Please sign in to upgrade to Pro');
      }
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authUser.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();
      
      if (url) {
        if (Platform.OS === 'web') {
          window.open(url, '_blank');
        } else {
          await Linking.openURL(url);
        }
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to start checkout process. Please try again.');
      } else {
        Alert.alert(
          'Error',
          'Failed to start checkout process. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!authUser?.id) {
      if (Platform.OS === 'web') {
        window.alert('Error: Please sign in to manage your subscription');
      } else {
        Alert.alert('Error', 'Please sign in to manage your subscription');
      }
      return;
    }

    try {
      const response = await fetch('/api/create-customer-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authUser.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create customer portal session');
      }

      const { url } = await response.json();
      
      if (url) {
        if (Platform.OS === 'web') {
          window.open(url, '_blank');
        } else {
          await Linking.openURL(url);
        }
      } else {
        throw new Error('No portal URL received');
      }
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to open subscription management. Please try again.');
      } else {
        Alert.alert(
          'Error',
          'Failed to open subscription management. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/forever',
      isPro: false,
      features: ['Maximum 3 drawings', 'Shorter conversation length', 'One daily drawing'],
    },
    {
      name: 'Pro',
      price: '$9.99',
      period: '/month',
      isPro: true,
      features: ['Unlimited drawings', 'Longer conversation length', 'Able to regenerate daily drawing'],
    },
  ];

  const PlanCard = ({ plan }: { plan: any }) => (
    <View style={[styles.planCard, plan.isPro && styles.proCard]}>
      <Text style={styles.planName}>{plan.name}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{plan.price}</Text>
        <Text style={styles.period}>{plan.period}</Text>
      </View>
      <View style={styles.featuresContainer}>
        {plan.features.map((feature: string, index: number) => (
          <View key={index} style={styles.featureRow}>
            <Check size={14} color={plan.isPro ? "#7C3AED" : "#6B7280"} />
            <Text style={[styles.featureText, plan.isPro && styles.proFeatureText]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (profile?.pro_status) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ChevronLeft size={24} color={isDark ? '#E5E7EB' : '#111827'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pro Membership</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.proStatusContainer}>
            <View style={styles.proStatusIcon}>
              <Crown size={48} color="#F59E0B" />
            </View>
            <Text style={styles.proStatusTitle}>You're a Pro Member!</Text>
            <Text style={styles.proStatusSubtitle}>
              Thank you for supporting Draw It!. You're enjoying all the premium features that help you grow as an artist.
            </Text>
            
            <TouchableOpacity
              style={styles.manageButton}
              onPress={handleManageSubscription}
            >
              <Text style={styles.manageButtonText}>Manage Subscription</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color={isDark ? '#E5E7EB' : '#111827'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade to Pro</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.heroContainer}>
          <View style={styles.heroIcon}>
            <Crown size={64} color="#F59E0B" />
          </View>
          <Text style={styles.heroTitle}>Unlock Your Creative Journey</Text>
          <Text style={styles.heroSubtitle}>
            Join thousands of artists who are accelerating their progress with unlimited practice and personalized AI guidance
          </Text>
        </View>

        <View style={styles.plansContainer}>
          <Text style={styles.plansTitle}>Choose Your Journey</Text>
          <View style={styles.plansGrid}>
            {plans.map((plan, index) => (
              <PlanCard key={index} plan={plan} />
            ))}
          </View>
        </View>

        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
            onPress={handleSubscribe}
            disabled={loading}
          >
            <Crown size={20} color="white" />
            <Text style={styles.subscribeButtonText}>
              {loading ? 'Processing...' : 'Start Your Pro Journey'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.ctaSubtext}>
            Cancel anytime. Start creating without limits today!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (isDark: boolean) => {
  return StyleSheet.create({
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
    headerRight: {
      width: 40,
    },
    scrollView: {
      flex: 1,
    },
    heroContainer: {
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 40,
    },
    heroIcon: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: isDark ? '#1C1C1E' : 'white',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      borderWidth: 3,
      borderColor: '#F59E0B',
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? '#E5E7EB' : '#111827',
      textAlign: 'center',
      marginBottom: 12,
    },
    heroSubtitle: {
      fontSize: 16,
      color: isDark ? '#A1A1AA' : '#6B7280',
      textAlign: 'center',
      lineHeight: 24,
    },
    plansContainer: {
      paddingHorizontal: 20,
      marginBottom: 32,
    },
    plansTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#E5E7EB' : '#111827',
      textAlign: 'center',
      marginBottom: 20,
    },
    plansGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    planCard: {
      flex: 1,
      backgroundColor: isDark ? '#1C1C1E' : 'white',
      borderRadius: 16,
      padding: 20,
      borderWidth: 2,
      borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
    },
    proCard: {
      borderColor: '#7C3AED',
      backgroundColor: isDark ? '#1A0B2E' : '#F3E8FF',
    },
    planName: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#E5E7EB' : '#111827',
      textAlign: 'center',
      marginBottom: 8,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      marginBottom: 16,
    },
    price: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#E5E7EB' : '#111827',
    },
    period: {
      fontSize: 14,
      color: isDark ? '#A1A1AA' : '#6B7280',
      marginLeft: 4,
    },
    featuresContainer: {
      gap: 8,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    featureText: {
      fontSize: 12,
      color: isDark ? '#A1A1AA' : '#6B7280',
      marginLeft: 8,
      flex: 1,
      lineHeight: 16,
    },
    proFeatureText: {
      color: '#7C3AED',
      fontWeight: '600',
    },
    ctaContainer: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      alignItems: 'center',
    },
    subscribeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#7C3AED',
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 16,
      marginBottom: 12,
      gap: 8,
    },
    subscribeButtonDisabled: {
      opacity: 0.6,
    },
    subscribeButtonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: '600',
    },
    ctaSubtext: {
      fontSize: 14,
      color: isDark ? '#A1A1AA' : '#6B7280',
      textAlign: 'center',
    },
    proStatusContainer: {
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 40,
    },
    proStatusIcon: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: isDark ? '#1C1C1E' : 'white',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      borderWidth: 3,
      borderColor: '#F59E0B',
    },
    proStatusTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#E5E7EB' : '#111827',
      textAlign: 'center',
      marginBottom: 12,
    },
    proStatusSubtitle: {
      fontSize: 16,
      color: isDark ? '#A1A1AA' : '#6B7280',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    manageButton: {
      backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#4B5563' : '#D1D5DB',
    },
    manageButtonText: {
      color: isDark ? '#E5E7EB' : '#111827',
      fontSize: 16,
      fontWeight: '600',
    },
  });
};

export default UpgradeScreen;