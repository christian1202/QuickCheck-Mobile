// Input — Ghost-style inputs with floating label per design system
import React, { useState } from 'react';
import { View, TextInput, Text, ViewStyle, TextInputProps, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';

interface InputProps extends TextInputProps {
  label: string;
  icon?: React.ReactNode;
  onIconPress?: () => void;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  onIconPress,
  error,
  containerStyle,
  ...textInputProps
}) => {
  const { theme } = useTheme();
  const { colors, radius, spacing } = theme;
  const [focused, setFocused] = useState(false);

  return (
    <View style={[{ marginBottom: spacing.lg }, containerStyle]}>
      <Text style={{
        fontFamily: 'Inter-SemiBold',
        fontSize: 10,
        letterSpacing: 1.6,
        textTransform: 'uppercase',
        color: error ? colors.error : colors.onSurfaceVariant,
        marginBottom: spacing.sm,
      }}>
        {label}
      </Text>
      <View style={{
        backgroundColor: colors.surfaceContainerHighest,
        borderRadius: radius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        borderBottomWidth: focused ? 2 : 1,
        borderBottomColor: error ? colors.error : focused ? colors.primary : colors.outline,
      }}>
        <TextInput
          {...textInputProps}
          onFocus={(e) => {
            setFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            textInputProps.onBlur?.(e);
          }}
          placeholderTextColor={colors.onSurfaceVariant}
          style={[{
            flex: 1,
            fontFamily: 'Inter',
            fontSize: 16,
            color: colors.onSurface,
            paddingVertical: 16,
          }, textInputProps.style]}
        />
        {icon && (
          onIconPress ? (
            <TouchableOpacity onPress={onIconPress} style={{ paddingLeft: spacing.sm, paddingVertical: spacing.sm }}>
              {icon}
            </TouchableOpacity>
          ) : (
            <View style={{ paddingLeft: spacing.sm }}>{icon}</View>
          )
        )}
      </View>
      {error && (
        <Text style={{
          fontFamily: 'Inter',
          fontSize: 12,
          color: colors.error,
          marginTop: 4,
        }}>
          {error}
        </Text>
      )}
    </View>
  );
};
