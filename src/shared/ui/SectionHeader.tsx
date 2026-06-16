// SectionHeader — Uppercase label-md tracking-widest section titles
import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;

  return (
    <View style={[{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    }, style]}>
      <View>
        {subtitle && (
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 10,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: colors.onSurfaceVariant,
            marginBottom: 2,
          }}>
            {subtitle}
          </Text>
        )}
        <Text style={{
          fontFamily: 'Manrope-Bold',
          fontSize: 20,
          color: colors.primary,
          letterSpacing: -0.3,
        }}>
          {title}
        </Text>
      </View>
      {action}
    </View>
  );
};
