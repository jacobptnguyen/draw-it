import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inMainApp = segments[0] === '(tabs)' || segments[0] === 'chatbot' || segments[0] === 'modal';

    // Check if user is authenticated (either regular user or anonymous)
    const isAuthenticated = user && user.id;
    const isAnonymous = user && user.id && !user.email;

    if (!isAuthenticated && inMainApp) {
      // User is not authenticated (no user ID) but trying to access main app
      router.replace('/(auth)');
    } else if (isAuthenticated && inAuthGroup) {
      // User is authenticated (regular or anonymous) but trying to access auth screens
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
