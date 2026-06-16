// FAB — Floating Action Button per the design system spec
import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface FABProps {
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  style?: ViewStyle;
  size?: number;
}

export const FAB: React.FC<FABProps> = ({
  onPress,
  icon = 'add',
  style,
  size = 56,
}) => {
  const { theme } = useTheme();
  const { colors, shadows } = theme;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[{
        position: 'absolute',
        bottom: 100,
        right: 24,
        width: size,
        height: size,
        borderRadius: size / 2,
        ...shadows.lg,
      }, style]}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryContainer]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialIcons name={icon} size={28} color={colors.white} />
      </LinearGradient>
    </TouchableOpacity>
  );
};
