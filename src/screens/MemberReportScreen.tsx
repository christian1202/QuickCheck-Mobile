// MemberReportScreen — Individual member profile/report matching the Stitch mockup
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Avatar, Card, StatusChip, ProgressBar, Button, SectionHeader } from '../components/ui';
import { MOCK_MEMBERS } from '../data/mockData';

export const MemberReportScreen: React.FC<{ navigation?: any; route?: any }> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, shadows } = theme;
  const memberId = route?.params?.memberId ?? 'm-001';
  const member = MOCK_MEMBERS.find(m => m.id === memberId) ?? MOCK_MEMBERS[0];

  const attendanceData = {
    overall: member.attendance_rate ?? 94,
    present: 42,
    late: 3,
    excused: 2,
    consecutiveStreak: 12,
  };

  const trendData = [72, 76, 82, 88, 91, 94];
  const trendMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const performanceByEvent = [
    { type: 'Sunday Service', rate: 98 },
    { type: 'Prayer Meeting', rate: 88 },
    { type: 'Special Event', rate: 85 },
  ];

  const history = [
    { date: '2024-06-16', event: 'Sunday Service', location: 'Hall A', status: 'present' as const },
    { date: '2024-06-09', event: 'Sunday Service', location: 'Hall A', status: 'present' as const },
    { date: '2024-06-06', event: 'Prayer Meeting', location: 'Chapel', status: 'late' as const },
    { date: '2024-06-02', event: 'Sunday Service', location: 'Hall A', status: 'present' as const },
    { date: '2024-05-26', event: 'Sunday Service', location: 'Hall A', status: 'absent' as const },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing.lg,
      }}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={{
            padding: spacing.sm,
            backgroundColor: colors.surfaceContainerLow,
            borderRadius: radius.lg,
          }}
        >
          <MaterialIcons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: colors.surfaceContainerHighest,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          borderRadius: radius.xl,
        }}>
          <MaterialIcons name="share" size={16} color={colors.primary} />
          <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 13, color: colors.primary }}>
            Share Report
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing['2xl'],
          paddingBottom: 120,
        }}
      >
        {/* Member Hero */}
        <View style={{ alignItems: 'center', marginBottom: spacing['2xl'] }}>
          <Avatar uri={member.photo_url} name={member.full_name} size={96} />
          <StatusChip status={member.status} size="sm" style={{ marginTop: spacing.md }} />
          <Text style={{
            fontFamily: 'Manrope-ExtraBold',
            fontSize: 28,
            color: colors.primary,
            marginTop: spacing.md,
            textAlign: 'center',
          }}>
            {member.full_name}
          </Text>
          <Text style={{
            fontFamily: 'Inter',
            fontSize: 14,
            color: colors.onSurfaceVariant,
          }}>
            {member.role_in_church} • {member.ministry_group}
          </Text>
        </View>

        {/* Overall Attendance Donut */}
        <Card style={{ alignItems: 'center', marginBottom: spacing['2xl'] }}>
          <SectionHeader title="Overall Attendance" />
          <View style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            borderWidth: 16,
            borderColor: colors.secondary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.lg,
          }}>
            <Text style={{
              fontFamily: 'Manrope-ExtraBold',
              fontSize: 32,
              color: colors.primary,
            }}>
              {attendanceData.overall}%
            </Text>
            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 10,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: colors.secondary,
            }}>
              Outstanding
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing['2xl'] }}>
            {[
              { label: 'Present', value: attendanceData.present, color: colors.secondary },
              { label: 'Late', value: attendanceData.late, color: colors.onTertiaryContainer },
              { label: 'Excused', value: attendanceData.excused, color: colors.primary },
            ].map(stat => (
              <View key={stat.label} style={{ alignItems: 'center' }}>
                <Text style={{
                  fontFamily: 'Manrope-Bold',
                  fontSize: 22,
                  color: stat.color,
                }}>
                  {stat.value}
                </Text>
                <Text style={{
                  fontFamily: 'Inter',
                  fontSize: 11,
                  color: colors.onSurfaceVariant,
                }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Attendance Trend */}
        <Card style={{ marginBottom: spacing['2xl'] }}>
          <SectionHeader title="Attendance Trend" />
          <View style={{
            height: 120,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 6,
          }}>
            {trendData.map((val, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: `${val}%`,
                  backgroundColor: i === trendData.length - 1 ? colors.primary : colors.primaryFixedDim,
                  borderTopLeftRadius: radius.md,
                  borderTopRightRadius: radius.md,
                }}
              />
            ))}
          </View>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: spacing.sm,
          }}>
            {trendMonths.map(m => (
              <Text key={m} style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 10,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: colors.onSurfaceVariant,
                flex: 1,
                textAlign: 'center',
              }}>
                {m}
              </Text>
            ))}
          </View>
        </Card>

        {/* Performance by Event */}
        <Card style={{ marginBottom: spacing['2xl'] }}>
          <SectionHeader title="Performance by Event" />
          <View style={{ gap: spacing.lg }}>
            {performanceByEvent.map(pe => (
              <View key={pe.type}>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}>
                  <Text style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 13,
                    color: colors.onSurface,
                  }}>
                    {pe.type}
                  </Text>
                  <Text style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 13,
                    color: colors.primary,
                  }}>
                    {pe.rate}%
                  </Text>
                </View>
                <ProgressBar progress={pe.rate} color={colors.primary} height={4} />
              </View>
            ))}
          </View>
        </Card>

        {/* Activity Streak */}
        <View style={{
          backgroundColor: colors.primary,
          borderRadius: radius.xl,
          padding: spacing['2xl'],
          alignItems: 'center',
          marginBottom: spacing['2xl'],
        }}>
          <MaterialIcons name="local-fire-department" size={32} color={colors.secondaryContainer} />
          <Text style={{
            fontFamily: 'Manrope-ExtraBold',
            fontSize: 36,
            color: colors.white,
            marginTop: spacing.sm,
          }}>
            {attendanceData.consecutiveStreak}
          </Text>
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 14,
            color: 'rgba(255,255,255,0.8)',
          }}>
            Consecutive Events
          </Text>
        </View>

        {/* Attendance History */}
        <SectionHeader title="Attendance History" />
        <View style={{ gap: spacing.md, marginBottom: spacing['2xl'] }}>
          {history.map((h, i) => (
            <Card key={i} variant="default" padding={16}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <View>
                  <Text style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 14,
                    color: colors.onSurface,
                  }}>
                    {h.event}
                  </Text>
                  <Text style={{
                    fontFamily: 'Inter',
                    fontSize: 12,
                    color: colors.onSurfaceVariant,
                    marginTop: 2,
                  }}>
                    {new Date(h.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })} • {h.location}
                  </Text>
                </View>
                <StatusChip status={h.status} size="sm" />
              </View>
            </Card>
          ))}
        </View>

        {/* Export Button */}
        <Button
          title="Export as PDF Report"
          onPress={() => {}}
          variant="primary"
          size="lg"
          fullWidth
          icon={<MaterialIcons name="picture-as-pdf" size={20} color={colors.white} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
