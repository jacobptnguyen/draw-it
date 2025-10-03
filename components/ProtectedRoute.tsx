import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from 'react-native';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = createStyles(isDark);

  // Handle navigation in useEffect to avoid setState during render
  useEffect(() => {
    // Only handle navigation when loading is complete
    if (!loading) {
      // Check if user is authenticated (either regular user or anonymous)
      const isAuthenticated = user && user.id;
      
      // If authentication is required and user is not authenticated, redirect to welcome screen
      if (requireAuth && !isAuthenticated) {
        router.replace('/(auth)');
      }
      // If user is authenticated (regular or anonymous) and trying to access auth pages, redirect to main app
      else if (!requireAuth && isAuthenticated) {
        router.replace('/(tabs)');
      }
    }
  }, [loading, user, requireAuth]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show loading state while redirecting (prevents flash of content)
  const isAuthenticated = user && user.id;
  
  if (requireAuth && !isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  // Show loading state while redirecting authenticated users away from auth pages
  if (!requireAuth && isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  // Render children if authentication requirements are met
  return <>{children}</>;
}

function createStyles(isDark: boolean) {
  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDark ? '#000' : '#fff',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: isDark ? '#999' : '#666',
    },
  });
}