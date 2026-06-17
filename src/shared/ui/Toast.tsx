import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, SlideInUp, SlideOutUp, Layout } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id: string;
  title: string;
  message?: string;
  type?: ToastType;
}

export const Toast: React.FC<ToastProps> = ({ title, message, type = 'info' }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, shadows } = theme;

  const getIcon = () => {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'error-outline';
      case 'info': default: return 'info-outline';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success': return colors.primary;
      case 'error': return colors.error;
      case 'info': default: return colors.secondary;
    }
  };

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(14).stiffness(150)}
      exiting={FadeOutUp.duration(300)}
      layout={Layout.springify()}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        padding: spacing.lg,
        marginHorizontal: spacing['2xl'],
        marginTop: spacing.sm,
        borderWidth: 1,
        borderColor: colors.surfaceContainerHighest,
        ...shadows.md,
      }}
    >
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surfaceContainerHighest,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
      }}>
        <MaterialIcons name={getIcon()} size={20} color={getIconColor()} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontFamily: 'Inter-SemiBold',
          fontSize: 14,
          color: colors.onSurface,
        }}>
          {title}
        </Text>
        {message && (
          <Text style={{
            fontFamily: 'Inter',
            fontSize: 12,
            color: colors.onSurfaceVariant,
            marginTop: 2,
          }}>
            {message}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};
