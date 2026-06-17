import React from 'react';
import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useTheme } from '../theme';

interface EmptyStateProps {
  iconName: keyof typeof MaterialIcons.glyphMap;
  title: string;
  message?: string;
  style?: StyleProp<ViewStyle>;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ iconName, title, message, style, action }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;

  return (
    <Animated.View 
      entering={FadeIn.duration(400)}
      style={[{ 
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: spacing['3xl'] 
      }, style]}
    >
      <Animated.View 
        entering={SlideInDown.springify().damping(12).stiffness(100)}
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.surfaceContainerHighest,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.lg,
        }}
      >
        <MaterialIcons name={iconName} size={40} color={colors.onSurfaceVariant} />
      </Animated.View>
      
      <Animated.Text 
        entering={SlideInDown.delay(100).springify()}
        style={{
          fontFamily: 'Manrope-Bold',
          fontSize: 20,
          color: colors.onSurface,
          textAlign: 'center',
          marginBottom: spacing.sm,
        }}
      >
        {title}
      </Animated.Text>
      
      {message && (
        <Animated.Text 
          entering={SlideInDown.delay(200).springify()}
          style={{
            fontFamily: 'Inter',
            fontSize: 14,
            color: colors.onSurfaceVariant,
            textAlign: 'center',
            lineHeight: 20,
            marginBottom: action ? spacing.xl : 0,
          }}
        >
          {message}
        </Animated.Text>
      )}

      {action && (
        <Animated.View entering={SlideInDown.delay(300).springify()}>
          {action}
        </Animated.View>
      )}
    </Animated.View>
  );
};
