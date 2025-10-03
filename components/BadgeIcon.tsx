import React from 'react';
import { View, Text, StyleSheet, Platform, useColorScheme, ColorSchemeName } from 'react-native';
import { Trophy } from 'lucide-react-native';

interface Badge {
  id: string;
  name: string;
  icon?: string;
  color: string;
  description?: string;
  earned: boolean;
}

interface BadgeIconProps {
  badge: Badge;
  size?: number;
}

// Reusable function to get platform-specific shadow styles
const getShadowStyles = (isDark: boolean) => {
  const shadowOpacity = isDark ? 0.3 : 0.1;
  const shadowColor = '#000';

  const base = Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity,
      shadowRadius: 2.22,
    },
    android: {
      elevation: 3,
    },
    default: {}, // fallback for web
  });

  // Only add `boxShadow` if on web (avoid warning in native)
  if (Platform.OS === 'web') {
    return {
      ...base,
      boxShadow: `0px 1px 2.22px rgba(0, 0, 0, ${shadowOpacity})`,
    };
  }

  return base;
};

export function BadgeIcon({ badge, size = 60 }: BadgeIconProps) {
  const colorScheme: ColorSchemeName = useColorScheme();
  const isDark: boolean = colorScheme === 'dark';

  const dynamicStyles = {
    width: size,
    height: size,
  };

  const styles = createStyles(isDark);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          dynamicStyles,
          getShadowStyles(isDark),
          {
            backgroundColor: badge.earned
              ? `${badge.color}20`
              : isDark
              ? '#2D3748'
              : '#F3F4F6',
          },
        ]}
      >
        {badge.earned ? (
          <Trophy size={24} color={badge.color} />
        ) : (
          <Text style={[styles.icon, styles.lockedIcon]}>{badge.icon}</Text>
        )}
      </View>
      <Text style={[styles.name, !badge.earned && styles.lockedText]} numberOfLines={1}>
        {badge.earned ? badge.name : 'Locked'}
      </Text>
    </View>
  );
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      maxWidth: 80,
    },
    badge: {
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      fontSize: 24,
    },
    lockedIcon: {
      color: isDark ? '#6B7280' : '#9CA3AF',
    },
    name: {
      fontSize: 12,
      color: isDark ? '#A1A1AA' : '#666',
      marginTop: 8,
      textAlign: 'center',
    },
    lockedText: {
      color: isDark ? '#6B7280' : '#9CA3AF',
    },
  });
