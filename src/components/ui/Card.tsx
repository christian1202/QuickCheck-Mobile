// Card — Tonal surface layering with ambient shadows (no borders per design system)
import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';

type CardVariant = 'default' | 'elevated' | 'filled' | 'gradient';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  padding,
}) => {
  const { theme } = useTheme();
  const { colors, radius, shadows, spacing } = theme;

  const variantStyles: Record<CardVariant, ViewStyle> = {
    default: {
      backgroundColor: colors.surfaceContainerLow,
      ...shadows.none,
    },
    elevated: {
      backgroundColor: colors.surfaceContainerLowest,
      ...shadows.md,
    },
    filled: {
      backgroundColor: colors.surfaceContainerHigh,
    },
    gradient: {
      backgroundColor: colors.primaryContainer,
    },
  };

  return (
    <View
      style={[
        {
          borderRadius: radius.xl,
          padding: padding ?? spacing['2xl'],
        },
        variantStyles[variant],
        style,
      ]}
    >
      {children}
    </View>
  );
};
