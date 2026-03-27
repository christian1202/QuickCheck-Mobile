// CreateEventScreen — Event creation form matching the Stitch mockup
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Input, Button, Card, FilterChips } from '../components/ui';

export const CreateEventScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, shadows } = theme;

  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('Sunday Service');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [audience, setAudience] = useState<'whole' | 'specific'>('whole');
  const [recurrence, setRecurrence] = useState('None');
  const [saveTemplate, setSaveTemplate] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing.lg,
        gap: spacing.md,
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
        <View>
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 10,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: colors.onSurfaceVariant,
          }}>
            EVENTS / NEW
          </Text>
          <Text style={{
            fontFamily: 'Manrope-Bold',
            fontSize: 22,
            color: colors.primary,
          }}>
            Create Event
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing['2xl'],
            paddingBottom: 120,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Information */}
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 10,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: colors.onSurfaceVariant,
            marginBottom: spacing.lg,
            marginTop: spacing.lg,
          }}>
            BASIC INFORMATION
          </Text>
          <Card style={{ marginBottom: spacing['2xl'] }}>
            <Input label="EVENT NAME" value={eventName} onChangeText={setEventName} placeholder="e.g. Sunday Morning Worship" />

            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 10,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: colors.onSurfaceVariant,
              marginBottom: spacing.md,
            }}>
              EVENT TYPE
            </Text>
            <View style={{
              backgroundColor: colors.surfaceContainerHighest,
              borderRadius: radius.lg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: spacing.lg,
              paddingVertical: 16,
              marginBottom: spacing.lg,
            }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 15, color: colors.onSurface }}>
                {eventType}
              </Text>
              <MaterialIcons name="expand-more" size={20} color={colors.outlineVariant} />
            </View>
          </Card>

          {/* Location & Schedule */}
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 10,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: colors.onSurfaceVariant,
            marginBottom: spacing.lg,
          }}>
            LOCATION & SCHEDULE
          </Text>
          <Card style={{ marginBottom: spacing['2xl'] }}>
            <Input label="LOCATION" value={location} onChangeText={setLocation} placeholder="Enter venue or location"
              icon={<MaterialIcons name="place" size={18} color={colors.outlineVariant} />}
            />
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Input label="DATE" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD"
                  icon={<MaterialIcons name="calendar-today" size={18} color={colors.outlineVariant} />}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="TIME" value={time} onChangeText={setTime} placeholder="HH:MM"
                  icon={<MaterialIcons name="schedule" size={18} color={colors.outlineVariant} />}
                />
              </View>
            </View>
          </Card>

          {/* Event Banner */}
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 10,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: colors.onSurfaceVariant,
            marginBottom: spacing.lg,
          }}>
            EVENT BANNER
          </Text>
          <TouchableOpacity style={{
            backgroundColor: colors.surfaceContainerLow,
            borderRadius: radius.xl,
            borderWidth: 2,
            borderColor: colors.outlineVariant + '30',
            borderStyle: 'dashed',
            padding: spacing['3xl'],
            alignItems: 'center',
            marginBottom: spacing['2xl'],
          }}>
            <MaterialIcons name="cloud-upload" size={36} color={colors.outlineVariant} />
            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 14,
              color: colors.primary,
              marginTop: spacing.md,
            }}>
              Upload Banner
            </Text>
            <Text style={{
              fontFamily: 'Inter',
              fontSize: 12,
              color: colors.onSurfaceVariant,
              marginTop: spacing.xs,
            }}>
              Recommended: 1200 × 400px
            </Text>
          </TouchableOpacity>

          {/* Target Audience */}
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 10,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: colors.onSurfaceVariant,
            marginBottom: spacing.lg,
          }}>
            TARGET AUDIENCE
          </Text>
          <Card style={{ marginBottom: spacing['2xl'] }}>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              {(['whole', 'specific'] as const).map(opt => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setAudience(opt)}
                  style={{
                    flex: 1,
                    paddingVertical: spacing.lg,
                    borderRadius: radius.xl,
                    backgroundColor: audience === opt ? colors.primary : colors.surfaceContainerHigh,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 13,
                    color: audience === opt ? colors.white : colors.onSurfaceVariant,
                  }}>
                    {opt === 'whole' ? 'Whole Church' : 'Specific Group'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Recurrence */}
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 10,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: colors.onSurfaceVariant,
            marginBottom: spacing.lg,
          }}>
            RECURRENCE
          </Text>
          <FilterChips
            options={['None', 'Daily', 'Weekly', 'Monthly']}
            selected={recurrence}
            onSelect={setRecurrence}
            style={{ marginBottom: spacing['2xl'] }}
          />

          {/* Save Template Toggle */}
          <Card style={{ marginBottom: spacing['2xl'] }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <Text style={{
                fontFamily: 'Inter',
                fontSize: 15,
                color: colors.onSurface,
              }}>
                Save as reusable template
              </Text>
              <Switch
                value={saveTemplate}
                onValueChange={setSaveTemplate}
                trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
                thumbColor={saveTemplate ? colors.primary : colors.surfaceContainerHighest}
              />
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom CTA */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing.lg,
        paddingBottom: spacing['3xl'],
        ...shadows.lg,
      }}>
        <Button
          title="Create Event"
          onPress={() => navigation?.goBack()}
          variant="primary"
          size="lg"
          fullWidth
          icon={<MaterialIcons name="add" size={20} color={colors.white} />}
        />
      </View>
    </SafeAreaView>
  );
};
