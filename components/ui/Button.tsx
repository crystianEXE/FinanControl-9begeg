import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'md',
  loading = false,
  disabled = false,
  style 
}: ButtonProps) {
  const isDisabled = disabled || loading;
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? theme.colors.primary : '#FFFFFF'} />
      ) : (
        <Text style={[
          styles.text,
          variant === 'outline' && styles.outlineText,
          styles[`${size}Text`],
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  primary: {
    backgroundColor: theme.colors.primary,
  },
  
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  
  success: {
    backgroundColor: theme.colors.success,
  },
  
  danger: {
    backgroundColor: theme.colors.danger,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  
  sm: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  
  md: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  
  lg: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  
  disabled: {
    opacity: 0.5,
  },
  
  text: {
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.semibold,
  },
  
  outlineText: {
    color: theme.colors.primary,
  },
  
  smText: {
    fontSize: theme.fontSize.sm,
  },
  
  mdText: {
    fontSize: theme.fontSize.md,
  },
  
  lgText: {
    fontSize: theme.fontSize.lg,
  },
});
