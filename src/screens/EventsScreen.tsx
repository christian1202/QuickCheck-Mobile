// EventsScreen — Event listing matching the Stitch mockup
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Card, FAB, Avatar, StatusChip, Button } from '../components/ui';
import { MOCK_EVENTS, MOCK_MEMBERS } from '../data/mockData';
import { EVENT_TYPE_LABELS } from '../constants';

export const EventsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, shadows } = theme;
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const typeChipColors: Record<string, { bg: string; text: string }> = {
    sunday_service: { bg: colors.primaryFixed, text: colors.primary },
    prayer_meeting: { bg: colors.secondaryContainer, text: colors.onSecondaryContainer },
    special_event: { bg: colors.tertiaryFixedDim, text: colors.tertiaryContainer },
    general_assembly: { bg: colors.surfaceContainerHighest, text: colors.onSurface },
    other: { bg: colors.surfaceContainerHigh, text: colors.onSurfaceVariant },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing['2xl'], paddingTop: spacing.lg, paddingBottom: spacing.md }}>
        <Text style={{
          fontFamily: 'Inter-SemiBold',
          fontSize: 10,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: colors.onSurfaceVariant,
        }}>
          CENTRAL REGISTRY
        </Text>
        <Text style={{
          fontFamily: 'Manrope-ExtraBold',
          fontSize: 32,
          color: colors.primary,
          letterSpacing: -1,
        }}>
          Events
        </Text>

        {/* Tabs */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: colors.surfaceContainerLow,
          borderRadius: radius.xl,
          padding: 4,
          marginTop: spacing.lg,
        }}>
          {(['upcoming', 'past'] as const).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={{
                flex: 1,
                paddingVertical: spacing.md,
                borderRadius: radius.lg,
                backgroundColor: tab === t ? colors.primary : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 13,
                color: tab === t ? colors.white : colors.onSurfaceVariant,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing['2xl'],
          paddingBottom: 120,
        }}
      >
        {/* Featured Event */}
        <Card variant="elevated" style={{
          marginBottom: spacing['2xl'],
          padding: 0,
          overflow: 'hidden',
        }}>
          {/* Event Image placeholder */}
          <View style={{
            height: 180,
            backgroundColor: colors.surfaceContainerHigh,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <MaterialIcons name="event" size={48} color={colors.outlineVariant} />
          </View>

          <View style={{ padding: spacing['2xl'] }}>
            {/* Type badges */}
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
              <View style={{
                backgroundColor: typeChipColors.general_assembly.bg,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 9999,
              }}>
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 10,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: typeChipColors.general_assembly.text,
                }}>
                  Assembly
                </Text>
              </View>
              <View style={{
                backgroundColor: typeChipColors.special_event.bg,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 9999,
              }}>
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 10,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: typeChipColors.special_event.text,
                }}>
                  Featured
                </Text>
              </View>
            </View>

            <Text style={{
              fontFamily: 'Manrope-Bold',
              fontSize: 22,
              color: colors.primary,
              letterSpacing: -0.5,
            }}>
              {MOCK_EVENTS[2].name}
            </Text>

            <View style={{ gap: 6, marginTop: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialIcons name="place" size={16} color={colors.onSurfaceVariant} />
                <Text style={{ fontFamily: 'Inter', fontSize: 13, color: colors.onSurfaceVariant }}>
                  {MOCK_EVENTS[2].location}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialIcons name="schedule" size={16} color={colors.onSurfaceVariant} />
                <Text style={{ fontFamily: 'Inter', fontSize: 13, color: colors.onSurfaceVariant }}>
                  Thursday, Oct 24 • 09:00 AM
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <MaterialIcons name="group" size={16} color={colors.onSurfaceVariant} />
                <Text style={{ fontFamily: 'Inter', fontSize: 13, color: colors.onSurfaceVariant }}>
                  {MOCK_EVENTS[2].expected_count?.toLocaleString()} expected attendees
                </Text>
              </View>
            </View>

            {/* Manage Roster */}
            <Button
              title="Manage Roster"
              onPress={() => navigation?.navigate('QuickMark', { eventId: MOCK_EVENTS[2].id })}
              variant="primary"
              size="md"
              fullWidth
              icon={<MaterialIcons name="how-to-reg" size={20} color={colors.white} />}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        </Card>

        {/* Event List */}
        {MOCK_EVENTS.slice(1, 5).map(event => {
          const typeColor = typeChipColors[event.event_type] ?? typeChipColors.other;
          return (
            <Card key={event.id} variant="default" style={{ marginBottom: spacing.lg }}>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
                <View style={{
                  backgroundColor: typeColor.bg,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 9999,
                }}>
                  <Text style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 10,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: typeColor.text,
                  }}>
                    {EVENT_TYPE_LABELS[event.event_type]}
                  </Text>
                </View>
                {event.is_recurring && (
                  <View style={{
                    backgroundColor: colors.primaryFixed,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 9999,
                  }}>
                    <Text style={{
                      fontFamily: 'Inter-SemiBold',
                      fontSize: 10,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      color: colors.primary,
                    }}>
                      Recurring
                    </Text>
                  </View>
                )}
              </View>

              <Text style={{
                fontFamily: 'Manrope-Bold',
                fontSize: 17,
                color: colors.primary,
                marginBottom: spacing.sm,
              }}>
                {event.name}
              </Text>

              <View style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialIcons name="place" size={14} color={colors.onSurfaceVariant} />
                  <Text style={{ fontFamily: 'Inter', fontSize: 12, color: colors.onSurfaceVariant }}>
                    {event.location}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <MaterialIcons name="schedule" size={14} color={colors.onSurfaceVariant} />
                  <Text style={{ fontFamily: 'Inter', fontSize: 12, color: colors.onSurfaceVariant }}>
                    {event.time} • {new Date(event.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              </View>

              {/* Attendee avatars */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: spacing.lg,
                justifyContent: 'space-between',
              }}>
                <View style={{ flexDirection: 'row' }}>
                  {MOCK_MEMBERS.slice(0, 3).map((m, i) => (
                    <View key={m.id} style={{ marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i }}>
                      <Avatar name={m.full_name} size={28} />
                    </View>
                  ))}
                </View>
                {event.is_recurring && (
                  <TouchableOpacity>
                    <Text style={{
                      fontFamily: 'Inter-SemiBold',
                      fontSize: 12,
                      color: colors.primary,
                    }}>
                      View Series →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </Card>
          );
        })}

        {/* Schedule New Event CTA */}
        <Card variant="filled" style={{
          alignItems: 'center',
          paddingVertical: spacing['3xl'],
          marginTop: spacing.md,
        }}>
          <MaterialIcons name="add-circle-outline" size={36} color={colors.primary} />
          <Text style={{
            fontFamily: 'Manrope-Bold',
            fontSize: 18,
            color: colors.primary,
            marginTop: spacing.md,
          }}>
            Schedule New Event
          </Text>
          <Text style={{
            fontFamily: 'Inter',
            fontSize: 13,
            color: colors.onSurfaceVariant,
            textAlign: 'center',
            marginTop: 4,
            maxWidth: 240,
          }}>
            Create a new event or use a template to set up recurring services.
          </Text>
        </Card>
      </ScrollView>

      <FAB
        onPress={() => navigation?.navigate('CreateEvent')}
        icon="add"
      />
    </SafeAreaView>
  );
};
