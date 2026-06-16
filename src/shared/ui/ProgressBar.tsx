// ProgressBar — Thin progress bar for attendance rates
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  trackColor,
  height = 6,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, radius } = theme;

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={[{
      height,
      backgroundColor: trackColor ?? colors.surfaceContainerHighest,
      borderRadius: height / 2,
      overflow: 'hidden',
    }, style]}>
      <View style={{
        height: '100%',
        width: `${clampedProgress}%`,
        backgroundColor: color ?? colors.secondary,
        borderRadius: height / 2,
      }} />
    </View>
  );
};
