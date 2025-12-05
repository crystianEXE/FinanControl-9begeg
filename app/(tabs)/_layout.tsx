import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import React from 'react';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  const renderIcon = (name: any) => {
    return ({ color, size }: { color: string; size: number }) => {
      return <Ionicons name={name} size={size} color={color} />;
    };
  };
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          height: Platform.select({
            ios: insets.bottom + 60,
            android: insets.bottom + 60,
            default: 70,
          }),
          paddingTop: 8,
          paddingBottom: Platform.select({
            ios: insets.bottom + 8,
            android: insets.bottom + 8,
            default: 8,
          }),
          paddingHorizontal: 16,
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: renderIcon('grid'),
        }}
      />
      <Tabs.Screen
        name="materials"
        options={{
          title: 'Materiais',
          tabBarIcon: renderIcon('cube'),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Clientes',
          tabBarIcon: renderIcon('people'),
        }}
      />
      <Tabs.Screen
        name="rentals"
        options={{
          title: 'Locados',
          tabBarIcon: renderIcon('document-text'),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Bip Scan',
          tabBarIcon: renderIcon('scan'),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Relatorios',
          tabBarIcon: renderIcon('bar-chart'),
        }}
      />
    </Tabs>
  );
}
