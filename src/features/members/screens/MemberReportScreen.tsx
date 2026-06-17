// MemberReportScreen — Individual member profile/report matching the Stitch mockup
// Uses useMembers() + useDI() for attendance queries — real data from WatermelonDB
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/theme';
import { Avatar, Card, StatusChip, ProgressBar, Button, SectionHeader } from '../../../shared/ui';
import { useMembers } from '..';
import { useDI } from '../../../core/di/container';
import type { AttendanceRecord, Member } from '../../../core/types/domain';

export const MemberReportScreen: React.FC<{ navigation?: any; route?: any }> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const { attendanceService } = useDI();
  const { members, fetchMembers } = useMembers();
  const memberId = route?.params?.memberId;
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const loadRecords = useCallback(async () => {
    if (!memberId) return;
    setIsLoadingRecords(true);
    try {
      const data = await attendanceService.getAttendanceForMember(memberId);
      setRecords(data as AttendanceRecord[]);
    } catch {
      setRecords([]);
    } finally {
      setIsLoadingRecords(false);
    }
  }, [memberId, attendanceService]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const member: Member | undefined = members.find(m => m.id === memberId) ?? members[0];

  // Compute stats from real attendance records
  const memberRecords = records;
  const totalRecords = memberRecords.length || 1;
  const presentCount = memberRecords.filter(r => r.status === 'present').length;
  const lateCount = memberRecords.filter(r => r.status === 'late').length;
  const absentCount = memberRecords.filter(r => r.status === 'absent').length;
  const overallRate = memberRecords.length > 0
    ? Math.round((presentCount / totalRecords) * 100)
    : (member?.attendance_rate ?? 0);

  // Trend: last 6 records
  const recentHistory = [...memberRecords]
    .sort((a, b) => new Date(b.marked_at ?? '').getTime() - new Date(a.marked_at ?? '').getTime())
    .slice(0, 6)
    .reverse();
  const trendData = recentHistory.length > 0
    ? recentHistory.map(r => r.status === 'present' ? 100 : r.status === 'late' ? 70 : 50)
    : [0, 0, 0, 0, 0, 0];
  const trendLabels = recentHistory.length > 0
    ? recentHistory.map(r => new Date(r.marked_at ?? '').toLocaleDateString('en', { month: 'short', day: 'numeric' }))
    : ['', '', '', '', '', ''];

  // Performance by event type
  const eventTypePerformance = (() => {
    const byType = new Map<string, { total: number; present: number }>();
    memberRecords.forEach(r => {
      const entry = byType.get(r.event_id) || { total: 0, present: 0 };
      entry.total++;
      if (r.status === 'present') entry.present++;
      byType.set(r.event_id, entry);
    });
    return Array.from(byType.entries()).map(([eventId, data]) => ({
      type: eventId.slice(0, 8),
      rate: Math.round((data.present / (data.total || 1)) * 100),
    })).slice(0, 3);
  })();

  // Consecutive streak
  const consecutiveStreak = (() => {
    let streak = 0;
    const sorted = [...memberRecords].sort((a, b) =>
      new Date(b.marked_at ?? '').getTime() - new Date(a.marked_at ?? '').getTime()
    );
    for (const r of sorted) {
      if (r.status === 'present') streak++;
      else break;
    }
    return streak;
  })();

  // History for display
  const history = [...memberRecords]
    .sort((a, b) => new Date(b.marked_at ?? '').getTime() - new Date(a.marked_at ?? '').getTime())
    .slice(0, 5);

  if (!member) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialIcons name="person-off" size={48} color={colors.onSurfaceVariant} />
        <Text style={{ fontFamily: 'Inter', fontSize: 16, color: colors.onSurfaceVariant, marginTop: spacing.md }}>
          Member not found.
        </Text>
      </SafeAreaView>
    );
  }

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
          {(member.status) && (
            <StatusChip status={member.status} size="sm" style={{ marginTop: spacing.md }} />
          )}
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
            {member.role_in_church || 'Member'} • {member.ministry_group || 'N/A'}
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
              {overallRate}%
            </Text>
            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 10,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              color: overallRate >= 90 ? colors.secondary : overallRate >= 70 ? colors.onTertiaryContainer : colors.error,
            }}>
              {overallRate >= 90 ? 'Excellent' : overallRate >= 70 ? 'Good' : 'At Risk'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing['2xl'] }}>
            {[
              { label: 'Present', value: presentCount, color: colors.secondary },
              { label: 'Late', value: lateCount, color: colors.onTertiaryContainer },
              { label: 'Absent', value: absentCount, color: colors.error },
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
            {trendLabels.map((m, i) => (
              <Text key={i} style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 8,
                letterSpacing: 0.5,
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
        {eventTypePerformance.length > 0 && (
          <Card style={{ marginBottom: spacing['2xl'] }}>
            <SectionHeader title="Performance by Event" />
            <View style={{ gap: spacing.lg }}>
              {eventTypePerformance.map((pe, i) => (
                <View key={i}>
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
                      Event {pe.type}
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
        )}

        {/* Activity Streak */}
        {consecutiveStreak > 0 && (
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
              {consecutiveStreak}
            </Text>
            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 14,
              color: 'rgba(255,255,255,0.8)',
            }}>
              Consecutive Events
            </Text>
          </View>
        )}

        {/* Attendance History */}
        <SectionHeader title="Attendance History" />
        {isLoadingRecords ? (
          <Card>
            <Text style={{
              fontFamily: 'Inter',
              fontSize: 13,
              color: colors.onSurfaceVariant,
              textAlign: 'center',
              paddingVertical: spacing.md,
            }}>
              Loading records...
            </Text>
          </Card>
        ) : (
          <View style={{ gap: spacing.md, marginBottom: spacing['2xl'] }}>
            {history.length === 0 ? (
              <Card>
                <Text style={{
                  fontFamily: 'Inter',
                  fontSize: 13,
                  color: colors.onSurfaceVariant,
                  textAlign: 'center',
                  paddingVertical: spacing.md,
                }}>
                  No attendance records yet.
                </Text>
              </Card>
            ) : (
              history.map((h, i) => (
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
                        Event {h.event_id.slice(0, 8)}
                      </Text>
                      <Text style={{
                        fontFamily: 'Inter',
                        fontSize: 12,
                        color: colors.onSurfaceVariant,
                        marginTop: 2,
                      }}>
                        {new Date(h.marked_at ?? '').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                    <StatusChip status={h.status} size="sm" />
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

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