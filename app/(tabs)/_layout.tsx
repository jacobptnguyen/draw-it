import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable, StyleSheet, Platform } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import ProtectedRoute from '@/components/ProtectedRoute';

function TabBarIcon({
  name,
  color,
  focused,
}: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  focused?: boolean;
}) {
  return (
    <FontAwesome
      name={name}
      size={24}
      color={color}
      style={{
        marginBottom: 2,
      }}
    />
  );
}

const getShadowStyles = (isDark: boolean) => {
  const shadowOpacity = isDark ? 0.2 : 0.08;

  return Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity,
      shadowRadius: 10,
    },
    android: {
      elevation: 10,
    },
    web: {
      boxShadow: `0px -2px 10px rgba(0, 0, 0, ${shadowOpacity})`,
    },
  });
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark: boolean = colorScheme === 'dark';

  const styles = createStyles(isDark);

  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabBarLabelStyle,
          tabBarStyle: styles.tabBarStyle,
          tabBarActiveTintColor: isDark ? '#FFFFFF' : '#000000',
          tabBarInactiveTintColor: isDark ? '#A1A1AA' : '#999999',
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Draw',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="pencil" color={color} focused={focused} />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={24}
                    color={Colors[colorScheme ?? 'light'].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
      </Tabs>
    </ProtectedRoute>
  );
}

const createStyles = (isDark: boolean) => {
  return StyleSheet.create({
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600',
      paddingBottom: 2,
      color: isDark ? '#E5E7EB' : '#111827',
    },
    tabBarStyle: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      position: 'absolute',
      borderTopWidth: 0.5,
      borderColor: isDark ? '#2C2C2E' : '#DDDDDD',
      height: 80,
      paddingBottom: 10,
      paddingTop: 10,
      ...getShadowStyles(isDark),
    },
  });
};
