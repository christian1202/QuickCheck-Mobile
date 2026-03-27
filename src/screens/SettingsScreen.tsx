// SettingsScreen — App settings matching the Stitch mockup
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Card, Button, Input } from '../components/ui';
import { MOCK_USER, MOCK_LOCAL } from '../data/mockData';

export const SettingsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const { colors, spacing, radius } = theme;
  const [darkMode, setDarkMode] = useState(isDark);
  const [preEventReminders, setPreEventReminders] = useState(true);
  const [absenceUpdates, setAbsenceUpdates] = useState(true);
  const [reminderTiming, setReminderTiming] = useState('30 min before');
  const [atRiskThreshold, setAtRiskThreshold] = useState(70);
  const [consecutiveAbsence, setConsecutiveAbsence] = useState(3);

  const toggleDarkMode = (val: boolean) => {
    setDarkMode(val);
    setThemeMode(val ? 'dark' : 'light');
  };

  const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <Text style={{
      fontFamily: 'Inter-SemiBold',
      fontSize: 10,
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      color: colors.onSurfaceVariant,
      marginBottom: spacing.md,
      marginTop: spacing['2xl'],
    }}>
      {title}
    </Text>
  );

  const SettingRow: React.FC<{
    label: string;
    value?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
  }> = ({ label, value, rightElement, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.lg,
      }}
    >
      <Text style={{
        fontFamily: 'Inter',
        fontSize: 15,
        color: colors.onSurface,
        flex: 1,
      }}>
        {label}
      </Text>
      {value && (
        <Text style={{
          fontFamily: 'Inter',
          fontSize: 14,
          color: colors.onSurfaceVariant,
          marginRight: spacing.sm,
        }}>
          {value}
        </Text>
      )}
      {rightElement}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing['2xl'],
          paddingBottom: 120,
        }}
      >
        {/* Header */}
        <View style={{ paddingTop: spacing.lg }}>
          <Text style={{
            fontFamily: 'Manrope-ExtraBold',
            fontSize: 32,
            color: colors.primary,
            letterSpacing: -1,
          }}>
            Settings
          </Text>
        </View>

        {/* Secretary Profile */}
        <SectionTitle title="SECRETARY PROFILE" />
        <Card>
          <SettingRow label="Full Name" value={MOCK_USER.full_name || ''} />
          <SettingRow label="Email Address" value={MOCK_USER.email} />
          <SettingRow label="Local Branch" value={MOCK_LOCAL.name} />
        </Card>

        {/* Appearance */}
        <SectionTitle title="APPEARANCE" />
        <Card>
          <SettingRow
            label="Dark Mode"
            rightElement={
              <Switch
                value={darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
                thumbColor={darkMode ? colors.primary : colors.surfaceContainerHighest}
              />
            }
          />
        </Card>

        {/* Notifications */}
        <SectionTitle title="NOTIFICATIONS" />
        <Card>
          <SettingRow
            label="Pre-event reminders"
            rightElement={
              <Switch
                value={preEventReminders}
                onValueChange={setPreEventReminders}
                trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
                thumbColor={preEventReminders ? colors.primary : colors.surfaceContainerHighest}
              />
            }
          />
          {preEventReminders && (
            <SettingRow
              label="Reminder timing"
              value={reminderTiming}
              rightElement={
                <MaterialIcons name="expand-more" size={18} color={colors.onSurfaceVariant} />
              }
            />
          )}
          <SettingRow
            label="Absence report updates"
            rightElement={
              <Switch
                value={absenceUpdates}
                onValueChange={setAbsenceUpdates}
                trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
                thumbColor={absenceUpdates ? colors.primary : colors.surfaceContainerHighest}
              />
            }
          />
        </Card>

        {/* Attendance Logic */}
        <SectionTitle title="ATTENDANCE LOGIC" />
        <Card>
          <View style={{ paddingVertical: spacing.lg }}>
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
                At-risk threshold
              </Text>
              <Text style={{
                fontFamily: 'Manrope-Bold',
                fontSize: 18,
                color: colors.primary,
              }}>
                {atRiskThreshold}%
              </Text>
            </View>
            {/* Simplified slider */}
            <View style={{
              height: 6,
              backgroundColor: colors.surfaceContainerHighest,
              borderRadius: 3,
              marginTop: spacing.md,
              overflow: 'hidden',
            }}>
              <View style={{
                height: '100%',
                width: `${atRiskThreshold}%`,
                backgroundColor: colors.primary,
                borderRadius: 3,
              }} />
            </View>
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: spacing.lg,
          }}>
            <Text style={{
              fontFamily: 'Inter',
              fontSize: 15,
              color: colors.onSurface,
            }}>
              Consecutive absence alert
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.md,
            }}>
              <TouchableOpacity
                onPress={() => setConsecutiveAbsence(Math.max(1, consecutiveAbsence - 1))}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceContainerHigh,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name="remove" size={18} color={colors.primary} />
              </TouchableOpacity>
              <Text style={{
                fontFamily: 'Manrope-Bold',
                fontSize: 18,
                color: colors.primary,
                minWidth: 24,
                textAlign: 'center',
              }}>
                {consecutiveAbsence}
              </Text>
              <TouchableOpacity
                onPress={() => setConsecutiveAbsence(consecutiveAbsence + 1)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.surfaceContainerHigh,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name="add" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Data Export */}
        <SectionTitle title="DATA EXPORT" />
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Button
            title="Export CSV"
            onPress={() => {}}
            variant="secondary"
            icon={<MaterialIcons name="file-download" size={18} color={colors.primary} />}
            style={{ flex: 1 }}
          />
          <Button
            title="Import CSV"
            onPress={() => {}}
            variant="secondary"
            icon={<MaterialIcons name="file-upload" size={18} color={colors.primary} />}
            style={{ flex: 1 }}
          />
        </View>

        {/* Log Out */}
        <View style={{ marginTop: spacing['3xl'] }}>
          <Button
            title="Log Out"
            onPress={() => {}}
            variant="destructive"
            fullWidth
            icon={<MaterialIcons name="logout" size={18} color={colors.onErrorContainer} />}
          />
        </View>

        {/* Version */}
        <Text style={{
          fontFamily: 'Inter',
          fontSize: 12,
          color: colors.outlineVariant,
          textAlign: 'center',
          marginTop: spacing['2xl'],
        }}>
          QuickCheck v1.0.0 (Build 1) • Phase 1
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};
