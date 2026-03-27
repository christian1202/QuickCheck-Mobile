// ReportsScreen — Analytics dashboard matching the Stitch mockup
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Card, FilterChips, ProgressBar, Avatar, Button } from '../components/ui';
import { MOCK_MEMBERS, MOCK_DASHBOARD } from '../data/mockData';

export const ReportsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, shadows } = theme;
  const [timeRange, setTimeRange] = useState('This Month');
  const [page, setPage] = useState(1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
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
          {/* Total Events */}
          <Card style={{ flex: 1 }}>
            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 10,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: colors.onSurfaceVariant,
            }}>
              Total Events
            </Text>
            <Text style={{
              fontFamily: 'Manrope-ExtraBold',
              fontSize: 36,
              color: colors.primary,
              marginTop: spacing.xs,
            }}>
              47
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
                +5 from last month
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
              86%
            </Text>
            <View style={{
              backgroundColor: colors.secondaryContainer,
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
                color: colors.onSecondaryContainer,
              }}>
                Stable
              </Text>
            </View>
          </Card>
        </View>

        {/* At-Risk Alert */}
        <View style={{ paddingHorizontal: spacing['2xl'], marginTop: spacing.lg }}>
          <View style={{
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
                8 members below 70% threshold
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.onErrorContainer} />
          </View>
        </View>

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
                Present
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
                Late
              </Text>
            </View>

            {/* Table rows */}
            {MOCK_MEMBERS.slice(0, 10).map((member, i) => (
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
                  <Avatar name={member.full_name} size={28} />
                  <View>
                    <Text style={{
                      fontFamily: 'Inter-SemiBold',
                      fontSize: 13,
                      color: colors.onSurface,
                    }} numberOfLines={1}>
                      {member.full_name}
                    </Text>
                    <Text style={{
                      fontFamily: 'Inter',
                      fontSize: 10,
                      color: colors.onSurfaceVariant,
                    }}>
                      {member.role_in_church}
                    </Text>
                  </View>
                </View>
                <Text style={{
                  flex: 1,
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 14,
                  color: colors.secondary,
                  textAlign: 'center',
                }}>
                  {Math.round((member.attendance_rate ?? 80) * 0.47)}
                </Text>
                <Text style={{
                  flex: 1,
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 14,
                  color: colors.onTertiaryContainer,
                  textAlign: 'center',
                }}>
                  {Math.round((100 - (member.attendance_rate ?? 80)) * 0.2)}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Pagination */}
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
                Showing 1 to 10 of 142 members
              </Text>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {[1, 2, 3].map(p => (
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
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
