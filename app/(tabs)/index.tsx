import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  useColorScheme,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { DrawingCard } from '@/components/DrawingCard';
import { Drawing, DailyChallenge } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { DAILY_CHALLENGE_DRAWING_ID } from '@/constants/DrawingIds';
import { useDrawings } from '@/hooks/useDrawings';
import { useDailyChallenges } from '@/hooks/useDailyChallenges';
import { useStreak } from '@/hooks/useStreak';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('screen');

const DrawTab = () => {
  const { user: authUser } = useAuth();
  const { profile, loading: profileLoading } = useProfile(authUser?.id);
  const { drawings, isLoading: drawingsLoading, createDrawing, deleteDrawing, updateDrawing, refreshDrawings, getMostRecentImageForDrawing } = useDrawings();
  const { todaysChallenge, loading: challengeLoading, generatingChallenge, refreshChallenges, regenerateTodaysChallenge } = useDailyChallenges();
  const { currentStreak, checkAndUpdateStreak } = useStreak(authUser?.id);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyChallengeImage, setDailyChallengeImage] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(colorScheme);
  const isWeb = Platform.OS === 'web';

  // body bg color for web
  useEffect(() => {
    if (isWeb && typeof document !== 'undefined') {
      document.body.style.backgroundColor = isDark ? '#121212' : '#F9FAFB';
    }
  }, [isDark, isWeb]);

  // refresh data when screen focused
  useFocusEffect(
    useCallback(() => {
      const checkAndRefresh = async () => {
        if (authUser?.id) {
          const shouldRefresh = await AsyncStorage.getItem('shouldRefreshDailyChallenge');
          
          Promise.all([
            refreshDrawings(),
            refreshChallenges(shouldRefresh === 'true'),
            loadDailyChallengeImage(),
          ]).then(async () => {
            if (shouldRefresh === 'true') {
              await AsyncStorage.removeItem('shouldRefreshDailyChallenge');
            }
          }).catch(error => {
            console.error('Error refreshing on focus:', error);
          });
        }
      };
      
      checkAndRefresh();
    }, [authUser?.id])
  );

  const handleCreateDrawing = async () => {
    if (!authUser?.id) {
      if (Platform.OS === 'web') {
        window.alert('Error: Please sign in to create drawings');
      } else {
        Alert.alert('Error', 'Please sign in to create drawings');
      }
      return;
    }

    try {
      const newDrawing = await createDrawing({
        title: 'New Drawing',
        user_id: authUser.id,
        is_daily_challenge: false,
        is_compare_feature: false,
      });

      if (!newDrawing) {
        if (Platform.OS === 'web') {
          window.alert('Error: Failed to create drawing');
        } else {
          Alert.alert('Error', 'Failed to create drawing');
        }
        return;
      }

      router.push({
        pathname: '/chatbot',
        params: { 
          drawingId: newDrawing.id,
          drawingTitle: newDrawing.title 
        }
      });
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to create drawing');
      } else {
        Alert.alert('Error', 'Failed to create drawing');
      }
    }
  };

  const handleDrawingPress = (drawing: Drawing) => {
    const navigationParams = {
      pathname: '/chatbot',
      params: { 
        drawingId: drawing.id,
        drawingTitle: drawing.title 
      }
    };
    
    try {
      router.push(navigationParams);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleDrawingDelete = async (id: string) => {
    try {
      await deleteDrawing(id);
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to delete drawing.');
      } else {
        Alert.alert('Error', 'Failed to delete drawing.');
      }
    }
  };

  const handleDrawingEditName = async (id: string, newName: string) => {
    try {
      await updateDrawing(id, { title: newName });
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to update drawing name.');
      } else {
        Alert.alert('Error', 'Failed to update drawing name.');
      }
    }
  };

  const handleDailyChallengeRefresh = async () => {
    try {
      await refreshChallenges(true);
      await loadDailyChallengeImage();
    } catch (error) {
      console.error('Error refreshing daily challenge:', error);
    }
  };

  const loadDailyChallengeImage = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('drawing_id', DAILY_CHALLENGE_DRAWING_ID)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessionsError || !sessions || sessions.length === 0) {
        setDailyChallengeImage(null);
        return;
      }

      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('image_url')
        .eq('chat_session_id', sessions[0].id)
        .eq('message_type', 'image')
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (messagesError || !messages || messages.length === 0) {
        setDailyChallengeImage(null);
        return;
      }

      setDailyChallengeImage(messages[0].image_url);
    } catch (error) {
      console.error('Error loading daily challenge image:', error);
      setDailyChallengeImage(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshDrawings(),
        refreshChallenges(),
        checkAndUpdateStreak(),
        loadDailyChallengeImage(),
      ]);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>🎨</Text>
      <Text style={styles.emptyStateTitle}>No drawings yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Start your artistic journey by creating your first drawing
      </Text>
      <TouchableOpacity style={styles.emptyStateButton} onPress={handleCreateDrawing}>
        <Text style={styles.emptyStateButtonText}>Create Your First Drawing</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTodaysChallenge = () => {
    if (generatingChallenge) {
      return (
        <View style={[styles.dailyChallengeCard, styles.loadingCard]}>
          <View style={styles.loadingContent}>
            <Text style={styles.loadingText}>Sharpening pencils… almost ready!</Text>
          </View>
        </View>
      );
    }

    if (!todaysChallenge) return null;

    const challengeDrawing: Drawing = {
      id: DAILY_CHALLENGE_DRAWING_ID,
      user_id: authUser?.id || '',
      title: todaysChallenge.title,
      prompt: todaysChallenge.prompt,
      image_url: dailyChallengeImage || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_daily_challenge: true,
      is_compare_feature: false,
    };

    const today = new Date().toISOString().split('T')[0];
    const hasUploadedToday = drawings.some(drawing => 
      drawing.is_daily_challenge && 
      drawing.created_at.startsWith(today)
    ) || !!dailyChallengeImage;

    return (
      <DrawingCard
        drawing={challengeDrawing}
        isFirst={true}
        onPress={() => handleDrawingPress(challengeDrawing)}
        currentStreak={currentStreak}
        isStreakSafe={hasUploadedToday}
      />
    );
  };

  const renderDrawings = () => {
    if (drawingsLoading) {
      return (
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Loading your drawings...</Text>
        </View>
      );
    }

    if (drawings.length === 0) {
      return null;
    }

    return drawings.map((drawing) => (
      <DrawingCard
        key={drawing.id}
        drawing={drawing}
        onPress={() => handleDrawingPress(drawing)}
        onDelete={handleDrawingDelete}
        onEditName={handleDrawingEditName}
      />
    ));
  };

  const Header = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>Draw It!</Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.avatarWrapper}>
          {profile?.profile_picture_url ? (
            <Image
              source={{ uri: profile.profile_picture_url }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {profile?.name?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    
      <Header />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colorScheme === 'dark' ? '#E5E7EB' : '#111827'}
          />
        }
      >
        {renderTodaysChallenge()}
        {renderDrawings()}
        {drawings.length === 0 && renderEmptyState()}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateDrawing}
      >
        <Plus size={24} color={isDark ? '#FFFFFF' : '#000000'} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const createStyles = (colorScheme: 'light' | 'dark' | null | undefined) => {
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#F9FAFB',
      paddingHorizontal: Platform.OS === 'web' ? 40 : 24,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: isWeb ? 8 : 12, // Reduced only on web
      paddingBottom: isWeb ? 8 : 16, // Reduced only on web
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    title: {
      fontSize: isWeb ? 28 : 32, // Smaller only on web
      fontWeight: 'bold',
      color: isDark ? '#E5E7EB' : '#111827',
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? '#A1A1AA' : '#6B7280',
      marginTop: 4,
    },

    avatarWrapper: {
      width: 48,
      height: 48,
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
    scrollContainer: {
      paddingBottom: 120,
    },
    emptyState: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: isWeb ? 16 : 40, // Reduced from 24 to 16 on web
    },
    emptyStateEmoji: {
      fontSize: isWeb ? 40 : 56, // Smaller from 48 to 40 on web
      marginBottom: isWeb ? 6 : 12, // Reduced from 8 to 6 on web
    },
    emptyStateTitle: {
      fontSize: isWeb ? 18 : 22, // Smaller from 20 to 18 on web
      fontWeight: 'bold',
      color: isDark ? '#E5E7EB' : '#111827',
      marginBottom: isWeb ? 3 : 6, // Reduced from 4 to 3 on web
      textAlign: 'center',
    },
    emptyStateSubtitle: {
      fontSize: isWeb ? 13 : 15, // Smaller from 14 to 13 on web
      color: isDark ? '#A1A1AA' : '#6B7280',
      textAlign: 'center',
      lineHeight: isWeb ? 18 : 22, // Reduced from 20 to 18 on web
      marginBottom: isWeb ? 12 : 24, // Reduced from 16 to 12 on web
      maxWidth: width * 0.7,
    },
    emptyStateButton: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: isWeb ? 10 : 16, // Smaller from 12 to 10 on web
      paddingHorizontal: isWeb ? 18 : 24, // Reduced from 20 to 18 on web
      paddingVertical: isWeb ? 10 : 16, // Reduced from 12 to 10 on web
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
    },
    emptyStateButtonText: {
      color: isDark ? '#E5E7EB' : '#111827',
      fontSize: 16,
      fontWeight: '600',
    },
    loadingState: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: isWeb ? 40 : 60, // Reduced only on web
    },
    loadingText: {
      fontSize: 16,
      color: isDark ? '#A1A1AA' : '#6B7280',
    },
    dailyChallengeCard: {
      marginBottom: isWeb ? 12 : 16, // Reduced only on web
    },
    loadingCard: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
      minHeight: 120,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    fab: {
      position: 'absolute',
      bottom: 90,
      right: 24,
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2E' : '#E5E7EB',
    },
  });
};

export default DrawTab;