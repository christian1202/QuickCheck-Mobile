// ReportsScreen — Analytics dashboard matching the Stitch mockup
// Uses useDashboard() + useMembers() hooks — real data from WatermelonDB
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/theme';
import { Card, FilterChips, ProgressBar, Avatar, Button } from '../../../shared/ui';
import { useDashboard } from '..';
import { useMembers } from '../../members';
import type { Member } from '../../../core/types/domain';

export const ReportsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const { data: dashboardData, refresh } = useDashboard();
  const { members, fetchMembers } = useMembers();
  const [timeRange, setTimeRange] = useState('This Month');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchMembers();
    refresh();
  }, [fetchMembers, refresh]);

  const data = dashboardData ?? {
    activeMembers: 0, membersTrend: 0, monthlyAvg: 0,
    attendanceTrend: [], trendMonths: [],
    statusDistribution: { present: 0, late: 0, absent: 0 },
    ministryGroups: [], atRiskMembers: [],
    birthdaysThisWeek: [], nextBirthday: { name: '', when: '' },
  };

  const membersPerPage = 10;
  const totalPages = Math.ceil(members.length / membersPerPage);
  const pagedMembers = members.slice((page - 1) * membersPerPage, page * membersPerPage);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: spacing['2xl'], paddingTop: spacing.lg }}>
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 10,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: colors.onSurfaceVariant,
          }}>
            SYSTEM ANALYTICS
          </Text>
          <Text style={{
            fontFamily: 'Manrope-ExtraBold',
            fontSize: 32,
            color: colors.primary,
            letterSpacing: -1,
          }}>
            Attendance Insights
          </Text>

          {/* Export buttons */}
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
            <TouchableOpacity style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: colors.surfaceContainerHighest,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderRadius: radius.xl,
            }}>
              <MaterialIcons name="picture-as-pdf" size={18} color={colors.primary} />
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 13, color: colors.primary }}>
                Export PDF
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: colors.surfaceContainerHighest,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderRadius: radius.xl,
            }}>
              <MaterialIcons name="table-chart" size={18} color={colors.primary} />
              <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 13, color: colors.primary }}>
                Export CSV
              </Text>
            </TouchableOpacity>
          </View>

          {/* Time Range */}
          <View style={{ marginTop: spacing.lg }}>
            <FilterChips
              options={['This Month', 'Last Month', 'Custom Range']}
              selected={timeRange}
              onSelect={setTimeRange}
            />
          </View>

          {/* Filters */}
          <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
            <TouchableOpacity style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.surfaceContainerLow,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderRadius: radius.xl,
            }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 13, color: colors.onSurface }}>
                All Members
              </Text>
              <MaterialIcons name="expand-more" size={18} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.surfaceContainerLow,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderRadius: radius.xl,
            }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 13, color: colors.onSurface }}>
                Ministry Group
              </Text>
              <MaterialIcons name="expand-more" size={18} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: spacing['2xl'],
          gap: spacing.lg,
          marginTop: spacing['2xl'],
        }}>
          {/* Total Members */}
          <Card style={{ flex: 1 }}>
            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 10,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: colors.onSurfaceVariant,
            }}>
              Total Members
            </Text>
            <Text style={{
              fontFamily: 'Manrope-ExtraBold',
              fontSize: 36,
              color: colors.primary,
              marginTop: spacing.xs,
            }}>
              {members.length}
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              marginTop: spacing.sm,
            }}>
              <MaterialIcons name="trending-up" size={14} color={colors.secondary} />
              <Text style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 12,
                color: colors.secondary,
              }}>
                +{data.membersTrend} this month
              </Text>
            </View>
          </Card>

          {/* Avg Attendance */}
          <Card style={{ flex: 1 }}>
            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 10,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: colors.onSurfaceVariant,
            }}>
              Avg Attendance
            </Text>
            <Text style={{
              fontFamily: 'Manrope-ExtraBold',
              fontSize: 36,
              color: colors.primary,
              marginTop: spacing.xs,
            }}>
              {data.monthlyAvg}%
            </Text>
            <View style={{
              backgroundColor: data.monthlyAvg >= 80 ? colors.secondaryContainer : colors.errorContainer,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 9999,
              alignSelf: 'flex-start',
              marginTop: spacing.sm,
            }}>
              <Text style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 10,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: data.monthlyAvg >= 80 ? colors.onSecondaryContainer : colors.onErrorContainer,
              }}>
                {data.monthlyAvg >= 80 ? 'Stable' : 'Needs Attention'}
              </Text>
            </View>
          </Card>
        </View>

        {/* At-Risk Alert */}
        {data.atRiskMembers.length > 0 && (
          <View style={{ paddingHorizontal: spacing['2xl'], marginTop: spacing.lg }}>
            <TouchableOpacity style={{
              backgroundColor: colors.errorContainer,
              borderRadius: radius.xl,
              padding: spacing['2xl'],
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.lg,
            }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: 'rgba(186,26,26,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <MaterialIcons name="warning" size={24} color={colors.error} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 15,
                  color: colors.onErrorContainer,
                }}>
                  At-Risk Members Detected
                </Text>
                <Text style={{
                  fontFamily: 'Inter',
                  fontSize: 12,
                  color: colors.onErrorContainer,
                  opacity: 0.8,
                  marginTop: 2,
                }}>
                  {data.atRiskMembers.length} member{data.atRiskMembers.length !== 1 ? 's' : ''} below 70% threshold
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={colors.onErrorContainer} />
            </TouchableOpacity>
          </View>
        )}

        {/* Member Performance Table */}
        <View style={{ paddingHorizontal: spacing['2xl'], marginTop: spacing['2xl'] }}>
          <Card>
            <Text style={{
              fontFamily: 'Manrope-Bold',
              fontSize: 18,
              color: colors.primary,
              marginBottom: spacing.lg,
            }}>
              Member Performance Details
            </Text>

            {/* Table header */}
            <View style={{
              flexDirection: 'row',
              paddingVertical: spacing.md,
              marginBottom: spacing.sm,
            }}>
              <Text style={{
                flex: 2,
                fontFamily: 'Inter-SemiBold',
                fontSize: 10,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: colors.onSurfaceVariant,
              }}>
                Member
              </Text>
              <Text style={{
                flex: 1,
                fontFamily: 'Inter-SemiBold',
                fontSize: 10,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: colors.onSurfaceVariant,
                textAlign: 'center',
              }}>
                Rate
              </Text>
              <Text style={{
                flex: 1,
                fontFamily: 'Inter-SemiBold',
                fontSize: 10,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: colors.onSurfaceVariant,
                textAlign: 'center',
              }}>
                Status
              </Text>
            </View>

            {/* Table rows */}
            {pagedMembers.length === 0 ? (
              <Text style={{
                fontFamily: 'Inter',
                fontSize: 13,
                color: colors.onSurfaceVariant,
                textAlign: 'center',
                paddingVertical: spacing.lg,
              }}>
                No members found.
              </Text>
            ) : (
              pagedMembers.map((member: Member, i: number) => (
                <TouchableOpacity
                  key={member.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: spacing.md,
                    backgroundColor: i % 2 === 0 ? 'transparent' : colors.surfaceContainerLow,
                    borderRadius: radius.lg,
                    paddingHorizontal: spacing.sm,
                  }}
                  onPress={() => navigation?.navigate('MemberReport', { memberId: member.id })}
                >
                  <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Avatar name={`${member.first_name} ${member.last_name}`} size={28} />
                    <View>
                      <Text style={{
                        fontFamily: 'Inter-SemiBold',
                        fontSize: 13,
                        color: colors.onSurface,
                      }} numberOfLines={1}>
                        {member.first_name} {member.last_name}
                      </Text>
                      <Text style={{
                        fontFamily: 'Inter',
                        fontSize: 10,
                        color: colors.onSurfaceVariant,
                      }}>
                        {member.role_in_church || ''}
                      </Text>
                    </View>
                  </View>
                  <Text style={{
                    flex: 1,
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 14,
                    color: (member.attendance_rate ?? 0) >= 70 ? colors.secondary : colors.error,
                    textAlign: 'center',
                  }}>
                    {member.attendance_rate ?? 0}%
                  </Text>
                  <Text style={{
                    flex: 1,
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 10,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: (member.attendance_rate ?? 0) >= 70 ? colors.secondary : colors.error,
                    textAlign: 'center',
                  }}>
                    {(member.attendance_rate ?? 0) >= 70 ? 'Good' : 'At Risk'}
                  </Text>
                </TouchableOpacity>
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: spacing.lg,
              }}>
                <Text style={{
                  fontFamily: 'Inter',
                  fontSize: 12,
                  color: colors.onSurfaceVariant,
                }}>
                  Showing {(page - 1) * membersPerPage + 1} to {Math.min(page * membersPerPage, members.length)} of {members.length} members
                </Text>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setPage(p)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: page === p ? colors.primary : colors.surfaceContainerHigh,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{
                        fontFamily: 'Inter-SemiBold',
                        fontSize: 12,
                        color: page === p ? colors.white : colors.onSurfaceVariant,
                      }}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};