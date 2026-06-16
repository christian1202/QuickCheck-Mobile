// StatusChip — pill-shaped semantic status indicators
import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';
export type MemberStatus = 'active' | 'inactive' | 'on_leave' | 'transferred';
export type AbsenceStatus = 'excused' | 'unexcused' | 'no_response' | 'under_review';

type ChipStatus = AttendanceStatus | MemberStatus | AbsenceStatus;

interface StatusChipProps {
  status: ChipStatus;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'md', style }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const config: Record<string, { bg: string; text: string; label: string }> = {
    present: { bg: colors.secondaryContainer, text: colors.onSecondaryContainer, label: 'PRESENT' },
    late: { bg: colors.tertiaryFixedDim, text: colors.tertiaryContainer, label: 'LATE' },
    absent: { bg: colors.errorContainer, text: colors.onErrorContainer, label: 'ABSENT' },
    excused: { bg: colors.secondaryContainer, text: colors.onSecondaryContainer, label: 'EXCUSED' },
    active: { bg: colors.secondaryContainer, text: colors.onSecondaryContainer, label: 'ACTIVE' },
    inactive: { bg: colors.surfaceContainerHigh, text: colors.onSurfaceVariant, label: 'INACTIVE' },
    on_leave: { bg: colors.tertiaryFixedDim, text: colors.tertiaryContainer, label: 'ON LEAVE' },
    transferred: { bg: colors.surfaceContainerHighest, text: colors.onSurfaceVariant, label: 'TRANSFERRED' },
    unexcused: { bg: colors.errorContainer, text: colors.onErrorContainer, label: 'UNEXCUSED' },
    no_response: { bg: colors.surfaceContainerHigh, text: colors.onSurfaceVariant, label: 'NO RESPONSE' },
    under_review: { bg: colors.tertiaryFixedDim, text: colors.tertiaryContainer, label: 'UNDER REVIEW' },
  };

  const c = config[status] ?? config.inactive;
  const isSmall = size === 'sm';

  return (
    <View style={[{
      backgroundColor: c.bg,
      paddingHorizontal: isSmall ? 8 : 12,
      paddingVertical: isSmall ? 3 : 5,
      borderRadius: 9999,
      alignSelf: 'flex-start',
    }, style]}>
      <Text style={{
        color: c.text,
        fontSize: isSmall ? 9 : 11,
        fontFamily: 'Inter-SemiBold',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
      }}>
        {c.label}
      </Text>
    </View>
  );
};
