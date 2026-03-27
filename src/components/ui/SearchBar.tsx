// SearchBar — Search input matching the member list mockup
import React from 'react';
import { View, TextInput, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  rightIcon?: React.ReactNode;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  style,
  rightIcon,
}) => {
  const { theme } = useTheme();
  const { colors, radius, spacing } = theme;

  return (
    <View style={[{
      backgroundColor: colors.surfaceContainerLow,
      borderRadius: radius.xl,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: 4,
    }, style]}>
      <MaterialIcons name="search" size={22} color={colors.onSurfaceVariant} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.outlineVariant}
        style={{
          flex: 1,
          fontFamily: 'Inter',
          fontSize: 15,
          color: colors.onSurface,
          paddingVertical: 12,
          marginLeft: spacing.sm,
        }}
      />
      {rightIcon}
    </View>
  );
};
