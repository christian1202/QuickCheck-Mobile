// Avatar — Circular member photo with optional status ring
import React from 'react';
import { View, Image, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: number;
  showStatusRing?: boolean;
  statusColor?: string;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 48,
  showStatusRing = false,
  statusColor,
  style,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const ringSize = showStatusRing ? 3 : 0;

  return (
    <View style={[{
      width: size + ringSize * 2,
      height: size + ringSize * 2,
      borderRadius: (size + ringSize * 2) / 2,
      borderWidth: ringSize,
      borderColor: statusColor ?? colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
    }, style]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />
      ) : (
        <View style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surfaceContainerHigh,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{
            fontFamily: 'Manrope-Bold',
            fontSize: size * 0.35,
            color: colors.primary,
          }}>
            {initials}
          </Text>
        </View>
      )}
    </View>
  );
};
