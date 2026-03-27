// FilterChips — Horizontal scrollable chip row for status filtering
import React from 'react';
import { ScrollView, TouchableOpacity, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface FilterChipsProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  style?: ViewStyle;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  selected,
  onSelect,
  style,
}) => {
  const { theme } = useTheme();
  const { colors, radius, spacing } = theme;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[{ gap: spacing.sm }, style]}
    >
      {options.map((opt) => {
        const isActive = opt === selected;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(opt)}
            activeOpacity={0.7}
            style={{
              backgroundColor: isActive ? colors.primary : colors.surfaceContainerLow,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.sm,
              borderRadius: radius.full,
            }}
          >
            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 12,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: isActive ? colors.white : colors.onSurfaceVariant,
            }}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
