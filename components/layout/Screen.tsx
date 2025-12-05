import React, { ReactNode } from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  style?: any;
}

export function Screen({ children, scroll = true, style }: ScreenProps) {
  const insets = useSafeAreaInsets();
  
  const Container = scroll ? ScrollView : View;
  
  return (
    <Container
      style={[
        styles.container,
        {
          paddingTop: Platform.select({
            ios: insets.top,
            android: insets.top,
            default: 0,
          }),
        },
        style,
      ]}
      contentContainerStyle={scroll ? styles.scrollContent : undefined}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  scrollContent: {
    padding: theme.spacing.md,
  },
});
