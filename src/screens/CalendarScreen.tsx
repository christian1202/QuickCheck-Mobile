// CalendarScreen — Advanced calendar matching the Stitch mockup
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Card, Avatar, StatusChip, Button } from '../components/ui';
import { MOCK_EVENTS, MOCK_MEMBERS } from '../data/mockData';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export const CalendarScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, shadows } = theme;
  const [selectedDate, setSelectedDate] = useState(24); // October 24
  const [currentMonth] = useState(9); // October (0-indexed)
  const [currentYear] = useState(2024);

  // Generate calendar grid for October 2024
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Simulated event indicators
  const eventDays: Record<number, 'full' | 'partial' | 'none'> = {
    6: 'full', 7: 'full', 12: 'partial', 13: 'full', 14: 'full',
    20: 'full', 21: 'full', 24: 'partial', 26: 'full', 27: 'full', 28: 'partial',
  };

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const selectedEvent = MOCK_EVENTS[1]; // For demo

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
            MASTER SCHEDULE
          </Text>
          <Text style={{
            fontFamily: 'Manrope-ExtraBold',
            fontSize: 32,
            color: colors.primary,
            letterSpacing: -1,
          }}>
            {MONTH_NAMES[currentMonth]} {currentYear}
          </Text>

          {/* Nav */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: spacing.lg,
          }}>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TouchableOpacity style={{
                padding: spacing.sm,
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: radius.lg,
              }}>
                <MaterialIcons name="chevron-left" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={{
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: radius.lg,
                justifyContent: 'center',
              }}>
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 13,
                  color: colors.primary,
                }}>
                  Today
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={{
                padding: spacing.sm,
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: radius.lg,
              }}>
                <MaterialIcons name="chevron-right" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}>
              <MaterialIcons name="today" size={18} color={colors.primary} />
              <Text style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 12,
                color: colors.primary,
              }}>
                Jump to Date
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Grid */}
        <Card style={{ marginHorizontal: spacing['2xl'], marginTop: spacing.lg }}>
          {/* Weekday headers */}
          <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
            {WEEKDAYS.map(d => (
              <View key={d} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 10,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: colors.onSurfaceVariant,
                }}>
                  {d}
                </Text>
              </View>
            ))}
          </View>

          {/* Date cells */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {calendarCells.map((day, i) => {
              const isSelected = day === selectedDate;
              const eventType = day ? eventDays[day] : undefined;
              const isToday = day === 24;

              return (
                <TouchableOpacity
                  key={i}
                  style={{
                    width: '14.28%',
                    aspectRatio: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => day && setSelectedDate(day)}
                  disabled={!day}
                >
                  {day && (
                    <View style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? colors.primary : 'transparent',
                    }}>
                      <Text style={{
                        fontFamily: 'Inter-SemiBold',
                        fontSize: 14,
                        color: isSelected ? colors.white : colors.onSurface,
                      }}>
                        {day}
                      </Text>
                      {eventType && !isSelected && (
                        <View style={{
                          position: 'absolute',
                          bottom: 2,
                          width: 5,
                          height: 5,
                          borderRadius: 2.5,
                          backgroundColor: eventType === 'full'
                            ? colors.secondary
                            : colors.onTertiaryContainer,
                        }} />
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Legend */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing['2xl'],
            marginTop: spacing.lg,
            paddingTop: spacing.lg,
          }}>
            {[
              { label: 'Fully Marked', color: colors.secondary },
              { label: 'Incomplete', color: colors.onTertiaryContainer },
              { label: 'No Event', color: colors.outlineVariant },
            ].map(item => (
              <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{
                  width: 6, height: 6, borderRadius: 3,
                  backgroundColor: item.color,
                }} />
                <Text style={{
                  fontFamily: 'Inter',
                  fontSize: 11,
                  color: colors.onSurfaceVariant,
                }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Monthly Goal */}
        <View style={{
          marginHorizontal: spacing['2xl'],
          marginTop: spacing['2xl'],
          backgroundColor: colors.primary,
          borderRadius: radius.xl,
          padding: spacing['2xl'],
        }}>
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 10,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
          }}>
            MONTHLY GOAL
          </Text>
          <Text style={{
            fontFamily: 'Manrope-ExtraBold',
            fontSize: 36,
            color: colors.white,
            marginVertical: spacing.sm,
          }}>
            87%
          </Text>
          <View style={{
            height: 6,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 3,
            overflow: 'hidden',
          }}>
            <View style={{
              height: '100%',
              width: '87%',
              backgroundColor: colors.secondaryContainer,
              borderRadius: 3,
            }} />
          </View>
          <Text style={{
            fontFamily: 'Inter',
            fontSize: 12,
            color: 'rgba(255,255,255,0.6)',
            marginTop: spacing.sm,
          }}>
            Overall attendance target reached
          </Text>
        </View>

        {/* Selected Date Detail */}
        <View style={{ paddingHorizontal: spacing['2xl'], marginTop: spacing['2xl'] }}>
          <Text style={{
            fontFamily: 'Manrope-Bold',
            fontSize: 20,
            color: colors.primary,
            marginBottom: spacing.lg,
          }}>
            Thursday, October {selectedDate}
          </Text>

          <Card>
            <Text style={{
              fontFamily: 'Manrope-Bold',
              fontSize: 17,
              color: colors.primary,
              marginBottom: 4,
            }}>
              {selectedEvent.name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialIcons name="place" size={14} color={colors.onSurfaceVariant} />
              <Text style={{ fontFamily: 'Inter', fontSize: 12, color: colors.onSurfaceVariant }}>
                {selectedEvent.location}
              </Text>
            </View>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
              <TouchableOpacity style={{
                flex: 1,
                backgroundColor: colors.surfaceContainerHigh,
                borderRadius: radius.lg,
                paddingVertical: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}>
                <MaterialIcons name="edit" size={18} color={colors.primary} />
                <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 13, color: colors.primary }}>
                  Edit Event
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={{
                flex: 1,
                backgroundColor: colors.surfaceContainerHigh,
                borderRadius: radius.lg,
                paddingVertical: spacing.md,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}>
                <MaterialIcons name="assignment-late" size={18} color={colors.primary} />
                <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 13, color: colors.primary }}>
                  Absence Report
                </Text>
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
              {[
                { label: 'PRESENT', value: '72', color: colors.secondary },
                { label: 'LATE', value: '08', color: colors.onTertiaryContainer },
                { label: 'ABSENT', value: '10', color: colors.error },
                { label: 'EXCUSED', value: '05', color: colors.primary },
              ].map(stat => (
                <View key={stat.label} style={{
                  flex: 1,
                  backgroundColor: colors.surfaceContainerLow,
                  borderRadius: radius.lg,
                  padding: spacing.md,
                  alignItems: 'center',
                }}>
                  <Text style={{
                    fontFamily: 'Manrope-Bold',
                    fontSize: 22,
                    color: stat.color,
                  }}>
                    {stat.value}
                  </Text>
                  <Text style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 8,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: colors.onSurfaceVariant,
                    marginTop: 2,
                  }}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* Attendee list */}
            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              {MOCK_MEMBERS.slice(0, 4).map(m => (
                <View key={m.id} style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                    <Avatar name={m.full_name} size={32} />
                    <Text style={{
                      fontFamily: 'Inter-SemiBold',
                      fontSize: 14,
                      color: colors.onSurface,
                    }}>
                      {m.full_name}
                    </Text>
                  </View>
                  <StatusChip status={m.latest_status ?? 'absent'} size="sm" />
                </View>
              ))}
            </View>

            <TouchableOpacity style={{ marginTop: spacing.lg, alignItems: 'center' }}>
              <Text style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 13,
                color: colors.primary,
              }}>
                View Full Attendee List →
              </Text>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
