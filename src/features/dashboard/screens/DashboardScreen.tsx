// DashboardScreen — Secretary home screen
// Uses useDashboard(), useAuth(), and useEvents() hooks — no mock data.
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../shared/theme';
import { Card, Avatar, ProgressBar, SectionHeader, Button } from '../../../shared/ui';
import { useAuth } from '../../auth';
import { useDashboard } from '..';
import { useEvents } from '../../events';
import type { Event } from '../../../core/types/domain';

export const DashboardScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, shadows } = theme;
  const { user } = useAuth();
  const { data: rawData, isLoading, refresh } = useDashboard();
  const { events, fetchEvents } = useEvents();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refresh(), fetchEvents()]);
    setRefreshing(false);
  }, [refresh, fetchEvents]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Fallback to empty defaults when data is null
  const data = rawData ?? {
    activeMembers: 0, membersTrend: 0, monthlyAvg: 0,
    attendanceTrend: [], trendMonths: [],
    statusDistribution: { present: 0, late: 0, absent: 0 },
    ministryGroups: [], atRiskMembers: [],
    birthdaysThisWeek: [], nextBirthday: { name: '', when: '' },
  };

  // Derived: today's upcoming event (first event with date >= today)
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingEvents = events
    .filter(e => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''));
  const todaysEvent = upcomingEvents.find(e => e.date === todayStr) ?? upcomingEvents[0] ?? null;
  const upcomingSchedule = upcomingEvents.slice(todaysEvent?.date === todayStr ? 1 : 0, todaysEvent?.date === todayStr ? 4 : 3);

  const userName = user?.fullName ?? user?.email?.split('@')[0] ?? 'Secretary';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing.lg,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Avatar uri={user?.photoUrl} name={userName} size={40} />
          <View>
            <Text style={{
              fontFamily: 'Manrope-Bold',
              fontSize: 20,
              color: colors.primaryContainer,
              letterSpacing: -0.5,
            }}>
              QuickCheck
            </Text>
            {user?.role && (
              <Text style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 10,
                letterSpacing: 1.6,
                textTransform: 'uppercase',
                color: colors.onSurfaceVariant,
              }}>
                {user.role} Dashboard
              </Text>
            )}
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <TouchableOpacity style={{ padding: spacing.sm }}>
            <MaterialIcons name="search" size={24} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: spacing.sm, position: 'relative' }}>
            <MaterialIcons name="notifications-none" size={24} color={colors.onSurfaceVariant} />
            <View style={{
              position: 'absolute', top: 6, right: 6,
              width: 8, height: 8, backgroundColor: colors.error,
              borderRadius: 4, borderWidth: 2, borderColor: colors.background,
            }} />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: spacing.sm }}>
            <MaterialIcons name="wifi-off" size={24} color={colors.primaryContainer} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Hero Greeting */}
        <View style={{ paddingHorizontal: spacing['2xl'], marginBottom: spacing['3xl'] }}>
          <Text style={{
            fontFamily: 'Manrope-ExtraBold',
            fontSize: 32,
            color: colors.primary,
            letterSpacing: -1,
          }}>
            {greeting()}, {userName.split(' ')[0]}
          </Text>
          <Text style={{
            fontFamily: 'Inter',
            fontSize: 16,
            color: colors.onSurfaceVariant,
            marginTop: 4,
          }}>
            Your church attendance dashboard
          </Text>
          <TouchableOpacity
            onPress={() => navigation?.navigate('Settings')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: colors.surfaceContainerHighest,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              borderRadius: radius.xl,
              alignSelf: 'flex-start',
              marginTop: spacing.lg,
            }}
          >
            <MaterialIcons name="file-download" size={18} color={colors.primary} />
            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 14, color: colors.primary }}>
              Export Data
            </Text>
          </TouchableOpacity>
        </View>

        {/* Today's Event Card */}
        {todaysEvent ? (
          <View style={{ paddingHorizontal: spacing['2xl'], marginBottom: spacing['2xl'] }}>
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                borderRadius: radius.xl,
                padding: spacing['2xl'],
                minHeight: 180,
                justifyContent: 'space-between',
                overflow: 'hidden',
              }}
            >
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm }}>
                  <MaterialIcons name="event" size={18} color={colors.secondaryContainer} />
                  <Text style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 10,
                    letterSpacing: 1.6,
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.7)',
                  }}>
                    {todaysEvent.date === todayStr ? "Today's Main Event" : 'Next Upcoming Event'}
                  </Text>
                </View>
                <Text style={{
                  fontFamily: 'Manrope-Bold',
                  fontSize: 24,
                  color: colors.white,
                  marginBottom: 4,
                }}>
                  {todaysEvent.name}
                </Text>
                <Text style={{
                  fontFamily: 'Inter',
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.7)',
                }}>
                  {todaysEvent.time ?? ''} • {todaysEvent.location}
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.secondaryContainer,
                  paddingHorizontal: spacing['2xl'],
                  paddingVertical: spacing.md,
                  borderRadius: radius.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  alignSelf: 'flex-start',
                  marginTop: spacing.lg,
                }}
                onPress={() => navigation?.navigate('QuickMark', { eventId: todaysEvent.id })}
              >
                <MaterialIcons name="how-to-reg" size={20} color={colors.onSecondaryContainer} />
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 14,
                  color: colors.onSecondaryContainer,
                }}>
                  Start Attendance
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        ) : (
          <View style={{ paddingHorizontal: spacing['2xl'], marginBottom: spacing['2xl'] }}>
            <Card variant="filled" style={{ alignItems: 'center', paddingVertical: spacing['3xl'] }}>
              <MaterialIcons name="event-busy" size={36} color={colors.onSurfaceVariant} />
              <Text style={{
                fontFamily: 'Manrope-Bold',
                fontSize: 18,
                color: colors.onSurfaceVariant,
                marginTop: spacing.md,
              }}>
                No upcoming events
              </Text>
              <Text style={{
                fontFamily: 'Inter',
                fontSize: 13,
                color: colors.onSurfaceVariant,
                marginTop: 4,
              }}>
                Create an event to start tracking attendance
              </Text>
            </Card>
          </View>
        )}

        {/* Stats Row */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: spacing['2xl'],
          gap: spacing.lg,
          marginBottom: spacing['2xl'],
        }}>
          {/* Active Members */}
          <Card style={{ flex: 1 }}>
            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 10,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: colors.onSurfaceVariant,
            }}>
              Active Members
            </Text>
            <Text style={{
              fontFamily: 'Manrope-ExtraBold',
              fontSize: 42,
              color: colors.primary,
              marginTop: spacing.sm,
            }}>
              {data.activeMembers.toLocaleString()}
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              marginTop: spacing.sm,
            }}>
              <MaterialIcons name="trending-up" size={16} color={colors.secondary} />
              <Text style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 13,
                color: colors.secondary,
              }}>
                +{data.membersTrend} this month
              </Text>
            </View>
          </Card>

          {/* Monthly Avg */}
          <Card style={{ flex: 1 }}>
            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 10,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: colors.onSurfaceVariant,
            }}>
              Monthly Avg
            </Text>
            <Text style={{
              fontFamily: 'Manrope-ExtraBold',
              fontSize: 42,
              color: colors.primary,
              marginTop: spacing.sm,
            }}>
              {data.monthlyAvg}%
            </Text>
            <ProgressBar progress={data.monthlyAvg} style={{ marginTop: spacing.md }} />
          </Card>
        </View>

        {/* Attendance Trend */}
        <View style={{ paddingHorizontal: spacing['2xl'], marginBottom: spacing['2xl'] }}>
          <Card>
            <SectionHeader title="Attendance Trend" action={
              <TouchableOpacity>
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 13,
                  color: colors.onSurfaceVariant,
                }}>
                  Last 6 Months ▾
                </Text>
              </TouchableOpacity>
            } />
            <View style={{
              height: 180,
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 6,
            }}>
              {data.attendanceTrend.map((val, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: `${val}%`,
                    backgroundColor: i === data.attendanceTrend.length - 1
                      ? colors.primary
                      : colors.primaryFixedDim,
                    borderTopLeftRadius: radius.lg,
                    borderTopRightRadius: radius.lg,
                  }}
                />
              ))}
            </View>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: spacing.md,
            }}>
              {data.trendMonths.map(m => (
                <Text key={m} style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 10,
                  letterSpacing: 1.6,
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
        </View>

        {/* Status Distribution & Ministry Groups */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: spacing['2xl'],
          gap: spacing.lg,
          marginBottom: spacing['2xl'],
        }}>
          {/* Status Distribution */}
          <Card style={{ flex: 1 }}>
            <Text style={{
              fontFamily: 'Manrope-Bold',
              fontSize: 16,
              color: colors.primary,
              marginBottom: spacing.lg,
            }}>
              Status Distribution
            </Text>
            <View style={{ alignItems: 'center' }}>
              {/* Simple donut representation */}
              <View style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                borderWidth: 12,
                borderColor: colors.secondary,
                borderRightColor: colors.onTertiaryContainer,
                borderBottomColor: colors.error,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.lg,
              }}>
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 11,
                  color: colors.onSurface,
                }}>
                  {new Date().toLocaleDateString('en', { month: 'short' }).toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={{ gap: spacing.sm }}>
              {[
                { label: 'Present', color: colors.secondary },
                { label: 'Late', color: colors.onTertiaryContainer },
                { label: 'Absent', color: colors.error },
              ].map(item => (
                <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
                  <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 12, color: colors.onSurface }}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Ministry Groups */}
          <Card style={{ flex: 1 }}>
            <Text style={{
              fontFamily: 'Manrope-Bold',
              fontSize: 16,
              color: colors.primary,
              marginBottom: spacing.lg,
            }}>
              Ministry Groups
            </Text>
            <View style={{ gap: spacing.lg }}>
              {data.ministryGroups.map(mg => (
                <View key={mg.name}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}>
                    <Text style={{
                      fontFamily: 'Inter-SemiBold',
                      fontSize: 11,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      color: colors.onSurfaceVariant,
                    }}>
                      {mg.name}
                    </Text>
                    <Text style={{
                      fontFamily: 'Inter-SemiBold',
                      fontSize: 11,
                      color: colors.onSurfaceVariant,
                    }}>
                      {mg.rate}%
                    </Text>
                  </View>
                  <ProgressBar
                    progress={mg.rate}
                    color={colors.primary}
                    height={4}
                  />
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* At-Risk Members */}
        <View style={{ paddingHorizontal: spacing['2xl'], marginBottom: spacing['2xl'] }}>
          <SectionHeader title="At-Risk Members" action={
            data.atRiskMembers.length > 0 ? (
              <View style={{
                backgroundColor: colors.errorContainer,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 9999,
              }}>
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 10,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: colors.onErrorContainer,
                }}>
                  {data.atRiskMembers.length} New
                </Text>
              </View>
            ) : undefined
          } />
          {data.atRiskMembers.length === 0 ? (
            <Text style={{
              fontFamily: 'Inter',
              fontSize: 13,
              color: colors.onSurfaceVariant,
              paddingVertical: spacing.md,
            }}>
              All members are in good standing.
            </Text>
          ) : (
            <View style={{ gap: spacing.md }}>
              {data.atRiskMembers.map((m, i) => (
                <View key={i} style={{
                  backgroundColor: colors.surfaceContainerLowest,
                  borderRadius: radius.xl,
                  padding: spacing.lg,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.error,
                  ...shadows.sm,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <View>
                    <Text style={{
                      fontFamily: 'Inter-SemiBold',
                      fontSize: 15,
                      color: colors.primary,
                    }}>
                      {m.name}
                    </Text>
                    <Text style={{
                      fontFamily: 'Inter',
                      fontSize: 12,
                      color: colors.onSurfaceVariant,
                      marginTop: 2,
                    }}>
                      {m.reason}
                    </Text>
                  </View>
                  <Text style={{
                    fontFamily: 'Manrope-Bold',
                    fontSize: 16,
                    color: colors.error,
                  }}>
                    {m.rate}%
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Birthdays */}
        <View style={{ paddingHorizontal: spacing['2xl'], marginBottom: spacing['2xl'] }}>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.lg }}>
              <MaterialIcons name="cake" size={20} color={colors.onTertiaryContainer} />
              <Text style={{
                fontFamily: 'Manrope-Bold',
                fontSize: 16,
                color: colors.primary,
              }}>
                Birthdays this week
              </Text>
            </View>
            {data.birthdaysThisWeek.length === 0 ? (
              <Text style={{
                fontFamily: 'Inter',
                fontSize: 13,
                color: colors.onSurfaceVariant,
              }}>
                No birthdays this week.
              </Text>
            ) : (
              <>
                <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
                  {data.birthdaysThisWeek.slice(0, 4).map((name, i) => (
                    <View key={i} style={{
                      marginLeft: i > 0 ? -12 : 0,
                      zIndex: data.birthdaysThisWeek.length - i,
                    }}>
                      <Avatar name={name} size={40} />
                    </View>
                  ))}
                  {data.birthdaysThisWeek.length > 4 && (
                    <View style={{
                      marginLeft: -12,
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text style={{
                        fontFamily: 'Inter-SemiBold',
                        fontSize: 10,
                        color: colors.white,
                      }}>
                        +{data.birthdaysThisWeek.length - 4}
                      </Text>
                    </View>
                  )}
                </View>
                {data.nextBirthday.name ? (
                  <Text style={{
                    fontFamily: 'Inter',
                    fontSize: 12,
                    color: colors.onSurfaceVariant,
                  }}>
                    Next: <Text style={{ fontFamily: 'Inter-SemiBold', color: colors.primary }}>
                      {data.nextBirthday.name}
                    </Text> ({data.nextBirthday.when})
                  </Text>
                ) : null}
              </>
            )}
          </Card>
        </View>

        {/* Upcoming Schedule */}
        <View style={{ paddingHorizontal: spacing['2xl'], marginBottom: spacing['3xl'] }}>
          <Card>
            <SectionHeader title="Upcoming Schedule" />
            {upcomingSchedule.length === 0 ? (
              <Text style={{
                fontFamily: 'Inter',
                fontSize: 13,
                color: colors.onSurfaceVariant,
                paddingVertical: spacing.md,
              }}>
                No upcoming events scheduled.
              </Text>
            ) : (
              <View style={{ gap: spacing.lg }}>
                {upcomingSchedule.map((event: Event) => (
                  <View key={event.id} style={{
                    flexDirection: 'row',
                    gap: spacing.lg,
                    alignItems: 'center',
                  }}>
                    <View style={{
                      width: 48,
                      height: 48,
                      backgroundColor: colors.surfaceContainerHighest,
                      borderRadius: radius.lg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text style={{
                        fontFamily: 'Inter-SemiBold',
                        fontSize: 10,
                        textTransform: 'uppercase',
                        color: colors.primary,
                      }}>
                        {new Date(event.date).toLocaleDateString('en', { month: 'short' })}
                      </Text>
                      <Text style={{
                        fontFamily: 'Manrope-Bold',
                        fontSize: 18,
                        color: colors.primary,
                        lineHeight: 20,
                      }}>
                        {new Date(event.date).getDate()}
                      </Text>
                    </View>
                    <View>
                      <Text style={{
                        fontFamily: 'Inter-SemiBold',
                        fontSize: 14,
                        color: colors.primary,
                      }}>
                        {event.name}
                      </Text>
                      <Text style={{
                        fontFamily: 'Inter',
                        fontSize: 12,
                        color: colors.onSurfaceVariant,
                        marginTop: 2,
                      }}>
                        {event.time} • {event.location}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};