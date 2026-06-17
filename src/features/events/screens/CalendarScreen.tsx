// CalendarScreen — Advanced calendar matching the Stitch mockup
// Uses useEvents() + useMembers() hooks — real data from WatermelonDB
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/theme';
import { Card, Avatar, StatusChip } from '../../../shared/ui';
import { useEvents } from '..';
import { useMembers } from '../../members';
import type { Event } from '../../../core/types/domain';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export const CalendarScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const { events, fetchEvents } = useEvents();
  const { members, fetchMembers } = useMembers();

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState(now.getDate());
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
    fetchMembers();
  }, [fetchEvents, fetchMembers]);

  // Calendar grid computation
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayStr = now.toISOString().split('T')[0];

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  // Map days that have events
  const eventDays = useMemo(() => {
    const map: Record<number, 'full' | 'partial'> = {};
    events.forEach(e => {
      try {
        const ed = new Date(e.date);
        if (ed.getMonth() === currentMonth && ed.getFullYear() === currentYear) {
          map[ed.getDate()] = map[ed.getDate()] ? 'full' : 'partial';
        }
      } catch { /* skip invalid dates */ }
    });
    return map;
  }, [events, currentMonth, currentYear]);

  // Navigate months
  const goToPrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDate(1);
  };
  const goToNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDate(1);
  };
  const goToToday = () => {
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setSelectedDate(now.getDate());
  };

  // When selected date changes, find events for that day
  useEffect(() => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    const dayEvents = events.filter(e => e.date === dateStr);
    setSelectedDayEvents(dayEvents);
  }, [selectedDate, currentMonth, currentYear, events]);

  // Monthly attendance rate (computed from member data)
  const monthlyRate = members.length > 0
    ? Math.round(members.reduce((sum, m) => sum + (m.attendance_rate ?? 0), 0) / members.length)
    : 0;

  // Event for detail display
  const selectedEvent = selectedDayEvents[0] ?? events[0];

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
              <TouchableOpacity
                onPress={goToPrevMonth}
                style={{
                  padding: spacing.sm,
                  backgroundColor: colors.surfaceContainerLow,
                  borderRadius: radius.lg,
                }}
              >
                <MaterialIcons name="chevron-left" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={goToToday}
                style={{
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.sm,
                  backgroundColor: colors.surfaceContainerLow,
                  borderRadius: radius.lg,
                  justifyContent: 'center',
                }}
              >
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 13,
                  color: colors.primary,
                }}>
                  Today
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={goToNextMonth}
                style={{
                  padding: spacing.sm,
                  backgroundColor: colors.surfaceContainerLow,
                  borderRadius: radius.lg,
                }}
              >
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
              const dateStr = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
              const isToday = dateStr === todayStr;

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
                      borderWidth: isToday && !isSelected ? 1 : 0,
                      borderColor: colors.primary,
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
              { label: 'Has Events', color: colors.secondary },
              { label: 'More Events', color: colors.onTertiaryContainer },
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
            MONTHLY ATTENDANCE
          </Text>
          <Text style={{
            fontFamily: 'Manrope-ExtraBold',
            fontSize: 36,
            color: colors.white,
            marginVertical: spacing.sm,
          }}>
            {monthlyRate}%
          </Text>
          <View style={{
            height: 6,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 3,
            overflow: 'hidden',
          }}>
            <View style={{
              height: '100%',
              width: `${monthlyRate}%`,
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
            Average member attendance this month
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
            {new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>

          {selectedEvent ? (
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

              {/* Attendee list */}
              <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
                {members.slice(0, 4).map(m => (
                  <View key={m.id} style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                      <Avatar name={`${m.first_name} ${m.last_name}`} size={32} />
                      <Text style={{
                        fontFamily: 'Inter-SemiBold',
                        fontSize: 14,
                        color: colors.onSurface,
                      }}>
                        {m.first_name} {m.last_name}
                      </Text>
                    </View>
                    <StatusChip status={m.latest_status ?? 'absent'} size="sm" />
                  </View>
                ))}
              </View>

              {members.length > 4 && (
                <TouchableOpacity style={{ marginTop: spacing.lg, alignItems: 'center' }}>
                  <Text style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 13,
                    color: colors.primary,
                  }}>
                    View All {members.length} Members →
                  </Text>
                </TouchableOpacity>
              )}
            </Card>
          ) : (
            <Card>
              <Text style={{
                fontFamily: 'Inter',
                fontSize: 14,
                color: colors.onSurfaceVariant,
                textAlign: 'center',
                paddingVertical: spacing.lg,
              }}>
                No events on this date.
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};