// SettingsScreen — App settings matching the Stitch mockup
// CSV Export/Import wired via csvUtils + Share API
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, TextInput, Share, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/theme';
import { Card, Button } from '../../../shared/ui';
import { useAuth } from '../../auth';
import { useExport } from '../../export';
import { useMembers } from '../../members';
import { useEvents } from '../../events';
import { useAttendance } from '../../attendance';
import { useDI } from '../../../core/di/container';
import { membersToCSV, eventsToCSV, attendanceToCSV, parseCSVMembers } from '../../../shared/utils/csvUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database, usersCollection } from '../../../core/database';
import { useAuthStore } from '../../auth/store/authStore';

// ── Helper Components ──

interface SectionTitleProps {
  title: string;
  colors: { onSurfaceVariant: string };
  spacing: Record<string, number>;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, colors, spacing }) => (
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

interface SettingRowProps {
  label: string;
  value?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  editable?: boolean;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  colors: { onSurface: string; onSurfaceVariant: string };
  spacing: Record<string, number>;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, value, rightElement, onPress, editable, onChangeText, onBlur, colors, spacing }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={!onPress && !editable}
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
    {editable ? (
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={label}
        placeholderTextColor={colors.onSurfaceVariant}
        style={{
          fontFamily: 'Inter',
          fontSize: 14,
          color: colors.onSurfaceVariant,
          marginRight: spacing.sm,
          textAlign: 'right',
          flex: 2,
          padding: 0,
        }}
      />
    ) : value ? (
      <Text style={{
        fontFamily: 'Inter',
        fontSize: 14,
        color: colors.onSurfaceVariant,
        marginRight: spacing.sm,
      }}>
        {value}
      </Text>
    ) : null}
    {rightElement}
  </TouchableOpacity>
);

// ── Main Screen ──

export const SettingsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { theme, setThemeMode, isDark } = useTheme();
  const { colors, spacing, radius } = theme;
  const { user, logout } = useAuth();
  const { memberService } = useDI();
  const { members, fetchMembers } = useMembers();
  const { events, fetchEvents } = useEvents();
  const { initSession } = useAttendance();
  const {
    isGoogleConnected, isConnecting, connectGoogle, disconnectGoogle,
    linkedSpreadsheetId, linkedSpreadsheetName, linkSpreadsheet, createAndLinkSpreadsheet,
    isExporting, lastExportTime, exportError, exportProgress,
    exportMembers, exportAttendance, exportEvents, exportAll,
    autoSaveEnabled, autoSaveGoogleSheets, toggleAutoSave, toggleAutoSaveGoogleSheets,
  } = useExport();
  const [darkMode, setDarkMode] = useState(isDark);
  const [preEventReminders, setPreEventReminders] = useState(true);
  const [absenceUpdates, setAbsenceUpdates] = useState(true);
  const [reminderTiming] = useState('30 min before');
  const [atRiskThreshold, setAtRiskThreshold] = useState(70);
  const [consecutiveAbsence, setConsecutiveAbsence] = useState(3);
  const [spreadsheetIdInput, setSpreadsheetIdInput] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [csvImportText, setCsvImportText] = useState('');
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);

  const [churchName, setChurchName] = useState('Grace Community Church');
  const [userName, setUserName] = useState(user?.fullName || '');
  const { setUser } = useAuthStore();

  React.useEffect(() => {
    AsyncStorage.getItem('quickcheck_church_name').then(val => {
      if (val) setChurchName(val);
    });
    if (user?.fullName) {
      setUserName(user.fullName);
    }
  }, [user?.fullName]);

  const handleSaveChurchName = async () => {
    await AsyncStorage.setItem('quickcheck_church_name', churchName);
  };

  const handleSaveUserName = async () => {
    if (!user || !user.id) return;
    try {
      await database.write(async () => {
        const u = await usersCollection.find(user.id);
        await u.update((record: any) => {
          record.fullName = userName;
        });
      });
      setUser({ ...user, fullName: userName });
    } catch (err) {
      console.error('Failed to update user name', err);
    }
  };

  const toggleDarkMode = useCallback((val: boolean) => {
    setDarkMode(val);
    setThemeMode(val ? 'dark' : 'light');
  }, [setThemeMode]);

  // ── Google Sheets handlers ──

  const handleConnectGoogle = useCallback(async () => {
    try {
      const success = await connectGoogle();
      if (success) {
        Alert.alert('Connected', 'Google account connected successfully!');
      } else {
        Alert.alert('Not Connected', 'Google sign-in was cancelled.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      Alert.alert('Error', message);
    }
  }, [connectGoogle]);

  const handleDisconnectGoogle = useCallback(() => {
    Alert.alert('Disconnect', 'Are you sure you want to disconnect your Google account?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Disconnect', style: 'destructive', onPress: () => disconnectGoogle().catch(() => {}) },
    ]);
  }, [disconnectGoogle]);

  const handleCreateSpreadsheet = useCallback(async () => {
    try {
      await createAndLinkSpreadsheet('QuickCheck Data');
      Alert.alert('Created', 'New Google Sheet created and linked!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create spreadsheet';
      Alert.alert('Error', message);
    }
  }, [createAndLinkSpreadsheet]);

  const handleLinkSpreadsheet = useCallback(async () => {
    if (!spreadsheetIdInput.trim()) {
      Alert.alert('Error', 'Please enter a spreadsheet ID');
      return;
    }
    try {
      await linkSpreadsheet(spreadsheetIdInput.trim());
      setSpreadsheetIdInput('');
      setShowLinkInput(false);
      Alert.alert('Linked', 'Spreadsheet linked successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to link spreadsheet';
      Alert.alert('Error', message);
    }
  }, [spreadsheetIdInput, linkSpreadsheet]);

  const handleExport = useCallback(async (type: 'members' | 'attendance' | 'events' | 'all') => {
    if (!linkedSpreadsheetId) {
      Alert.alert('No Spreadsheet', 'Please link a Google Sheet first.');
      return;
    }
    try {
      switch (type) {
        case 'members': await exportMembers(); break;
        case 'attendance': await exportAttendance(); break;
        case 'events': await exportEvents(); break;
        case 'all': await exportAll(); break;
      }
      Alert.alert('Success', 'Data exported to Google Sheets!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      Alert.alert('Export Failed', message);
    }
  }, [linkedSpreadsheetId, exportMembers, exportAttendance, exportEvents, exportAll]);

  // ── CSV Export ──

  const handleCsvExport = useCallback(async () => {
    try {
      await fetchMembers();
      await fetchEvents();
      const csv = membersToCSV(members);
      await Share.share({ message: csv, title: 'QuickCheck Members Export.csv' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to export';
      Alert.alert('Export Failed', message);
    }
  }, [members, events, fetchMembers, fetchEvents]);

  // ── CSV Import ──

  const handleCsvImport = useCallback(async () => {
    if (!csvImportText.trim()) {
      Alert.alert('Error', 'Paste CSV content in the text field first.');
      return;
    }
    setCsvImporting(true);
    try {
      const parsed = parseCSVMembers(csvImportText);
      if (parsed.length === 0) {
        Alert.alert('No Data', 'No valid member rows found in CSV.');
        return;
      }
      let imported = 0;
      for (const m of parsed) {
        try {
          await memberService.createMember({
            ...m,
            local_id: 'local_001',
            full_name: m.full_name,
          } as any);
          imported++;
        } catch {
          // skip duplicates
        }
      }
      setCsvImportText('');
      setShowCsvImport(false);
      await fetchMembers();
      Alert.alert('Imported', `${imported} of ${parsed.length} members imported.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Import failed';
      Alert.alert('Import Failed', message);
    } finally {
      setCsvImporting(false);
    }
  }, [csvImportText, memberService, fetchMembers]);

  // ── Logout ──

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout().catch(() => {}) },
    ]);
  }, [logout]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing['2xl'],
          paddingBottom: 120,
        }}
      >
        {/* Header */}
        <View style={{ paddingTop: spacing.lg, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={{ marginRight: spacing.md, padding: spacing.xs, marginLeft: -spacing.xs }}
          >
            <MaterialIcons name="arrow-back" size={28} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={{
            fontFamily: 'Manrope-ExtraBold',
            fontSize: 32,
            color: colors.primary,
            letterSpacing: -1,
          }}>
            Settings
          </Text>
        </View>

        {/* Profile Header */}
        <View style={{ alignItems: 'center', marginBottom: spacing['2xl'] }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.primaryContainer,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
          }}>
            <Text style={{
              fontFamily: 'Manrope-Bold',
              fontSize: 32,
              color: colors.primary,
            }}>
              {userName?.charAt(0) || 'U'}
            </Text>
          </View>
          <Text style={{
            fontFamily: 'Manrope-Bold',
            fontSize: 24,
            color: colors.onSurface,
          }}>
            {userName || 'User'}
          </Text>
          <Text style={{
            fontFamily: 'Inter',
            fontSize: 14,
            color: colors.onSurfaceVariant,
          }}>
            {user?.email || ''}
          </Text>
        </View>

        {/* Church Profile */}
        <SectionTitle title="PROFILE" colors={colors} spacing={spacing} />
        <Card>
          <SettingRow 
            label="Your Name" 
            value={userName} 
            editable 
            onChangeText={setUserName} 
            onBlur={handleSaveUserName}
            colors={colors} 
            spacing={spacing} 
          />
          <SettingRow 
            label="Church Name" 
            value={churchName} 
            editable 
            onChangeText={setChurchName} 
            onBlur={handleSaveChurchName}
            colors={colors} 
            spacing={spacing} 
          />
          <SettingRow label="Role" value={user?.role || 'Administrator'} colors={colors} spacing={spacing} />
        </Card>

        {/* Appearance */}
        <SectionTitle title="APPEARANCE" colors={colors} spacing={spacing} />
        <Card>
          <SettingRow
            label="Dark Mode"
            colors={colors}
            spacing={spacing}
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
        <SectionTitle title="NOTIFICATIONS" colors={colors} spacing={spacing} />
        <Card>
          <SettingRow
            label="Pre-event reminders"
            colors={colors}
            spacing={spacing}
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
              colors={colors}
              spacing={spacing}
              rightElement={
                <MaterialIcons name="expand-more" size={18} color={colors.onSurfaceVariant} />
              }
            />
          )}
          <SettingRow
            label="Absence report updates"
            colors={colors}
            spacing={spacing}
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
        <SectionTitle title="ATTENDANCE LOGIC" colors={colors} spacing={spacing} />
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
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
              }}>
                <TouchableOpacity
                  onPress={() => setAtRiskThreshold(Math.max(0, atRiskThreshold - 5))}
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
                  minWidth: 48,
                  textAlign: 'center',
                }}>
                  {atRiskThreshold}%
                </Text>
                <TouchableOpacity
                  onPress={() => setAtRiskThreshold(Math.min(100, atRiskThreshold + 5))}
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
                backgroundColor: colors.error,
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

        {/* Google Sheets Integration */}
        <SectionTitle title="GOOGLE SHEETS INTEGRATION" colors={colors} spacing={spacing} />
        <Card>
          <SettingRow
            label="Google Account"
            value={isGoogleConnected ? 'Connected' : 'Not connected'}
            colors={colors}
            spacing={spacing}
            rightElement={
              isGoogleConnected ? (
                <TouchableOpacity onPress={handleDisconnectGoogle}>
                  <MaterialIcons name="link-off" size={20} color={colors.error} />
                </TouchableOpacity>
              ) : (
                <MaterialIcons
                  name="link"
                  size={20}
                  color={isConnecting ? colors.outlineVariant : colors.primary}
                />
              )
            }
          />

          {!isGoogleConnected ? (
            <Button
              title={isConnecting ? 'Connecting...' : 'Connect Google Account'}
              onPress={handleConnectGoogle}
              variant="primary"
              fullWidth
              disabled={isConnecting}
              icon={<MaterialIcons name="cloud" size={18} color={colors.white} />}
            />
          ) : (
            <>
              {linkedSpreadsheetId ? (
                <SettingRow
                  label="Linked Sheet"
                  value={linkedSpreadsheetName ?? linkedSpreadsheetId}
                  onPress={() => setShowLinkInput(!showLinkInput)}
                  colors={colors}
                  spacing={spacing}
                />
              ) : (
                <Text style={{
                  fontFamily: 'Inter',
                  fontSize: 14,
                  color: colors.onSurfaceVariant,
                  paddingVertical: spacing.md,
                }}>
                  No spreadsheet linked.
                </Text>
              )}

              {showLinkInput && (
                <View style={{ paddingTop: spacing.sm }}>
                  <TextInput
                    style={{
                      backgroundColor: colors.surfaceContainerHighest,
                      borderRadius: radius.lg,
                      padding: spacing.md,
                      fontSize: 14,
                      fontFamily: 'Inter',
                      color: colors.onSurface,
                      marginBottom: spacing.sm,
                    }}
                    placeholder="Enter spreadsheet ID..."
                    placeholderTextColor={colors.outlineVariant}
                    value={spreadsheetIdInput}
                    onChangeText={setSpreadsheetIdInput}
                    autoCapitalize="none"
                  />
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    <Button
                      title="Link"
                      onPress={handleLinkSpreadsheet}
                      variant="secondary"
                      style={{ flex: 1 }}
                    />
                    <Button
                      title="Cancel"
                      onPress={() => { setShowLinkInput(false); setSpreadsheetIdInput(''); }}
                      variant="secondary"
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              )}

              {!showLinkInput && (
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                  <Button
                    title={linkedSpreadsheetId ? 'Change Sheet' : 'Link Sheet'}
                    onPress={() => setShowLinkInput(true)}
                    variant="secondary"
                    style={{ flex: 1 }}
                    icon={<MaterialIcons name="edit" size={16} color={colors.primary} />}
                  />
                  <Button
                    title="Create New"
                    onPress={handleCreateSpreadsheet}
                    variant="secondary"
                    style={{ flex: 1 }}
                    icon={<MaterialIcons name="add" size={16} color={colors.primary} />}
                  />
                </View>
              )}
            </>
          )}
        </Card>

        {/* Auto-Save */}
        <SectionTitle title="AUTO-SAVE" colors={colors} spacing={spacing} />
        <Card>
          <SettingRow
            label="Auto-Save to Device"
            colors={colors}
            spacing={spacing}
            rightElement={
              <Switch
                value={autoSaveEnabled}
                onValueChange={() => toggleAutoSave()}
                trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
                thumbColor={autoSaveEnabled ? colors.primary : colors.surfaceContainerHighest}
              />
            }
          />
          {isGoogleConnected && (
            <SettingRow
              label="Auto-Save to Google Sheets"
              value={autoSaveGoogleSheets ? 'On' : 'Off'}
              colors={colors}
              spacing={spacing}
              rightElement={
                <Switch
                  value={autoSaveGoogleSheets}
                  onValueChange={() => toggleAutoSaveGoogleSheets()}
                  trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
                  thumbColor={autoSaveGoogleSheets ? colors.primary : colors.surfaceContainerHighest}
                />
              }
            />
          )}
        </Card>

        {/* Data Export */}
        <SectionTitle title="DATA EXPORT" colors={colors} spacing={spacing} />
        {isGoogleConnected && linkedSpreadsheetId ? (
          <>
            {exportProgress && (
              <View style={{
                backgroundColor: colors.primaryContainer,
                borderRadius: radius.lg,
                padding: spacing.md,
                marginBottom: spacing.md,
              }}>
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 13,
                  color: colors.onPrimaryContainer,
                }}>
                  {exportProgress}
                </Text>
              </View>
            )}

            {exportError && (
              <View style={{
                backgroundColor: colors.errorContainer,
                borderRadius: radius.lg,
                padding: spacing.md,
                marginBottom: spacing.md,
              }}>
                <Text style={{
                  fontFamily: 'Inter',
                  fontSize: 13,
                  color: colors.onErrorContainer,
                }}>
                  {exportError}
                </Text>
              </View>
            )}

            {lastExportTime && (
              <Text style={{
                fontFamily: 'Inter',
                fontSize: 12,
                color: colors.onSurfaceVariant,
                marginBottom: spacing.md,
              }}>
                Last export: {new Date(lastExportTime).toLocaleString()}
              </Text>
            )}

            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Button
                  title="Members"
                  onPress={() => handleExport('members')}
                  variant="secondary"
                  disabled={isExporting}
                  style={{ flex: 1 }}
                  icon={<MaterialIcons name="people" size={18} color={colors.primary} />}
                />
                <Button
                  title="Attendance"
                  onPress={() => handleExport('attendance')}
                  variant="secondary"
                  disabled={isExporting}
                  style={{ flex: 1 }}
                  icon={<MaterialIcons name="checklist" size={18} color={colors.primary} />}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Button
                  title="Events"
                  onPress={() => handleExport('events')}
                  variant="secondary"
                  disabled={isExporting}
                  style={{ flex: 1 }}
                  icon={<MaterialIcons name="event" size={18} color={colors.primary} />}
                />
                <Button
                  title={isExporting ? 'Exporting...' : 'Export All'}
                  onPress={() => handleExport('all')}
                  variant="primary"
                  disabled={isExporting}
                  style={{ flex: 1 }}
                  icon={<MaterialIcons name="cloud-upload" size={18} color={colors.white} />}
                />
              </View>
            </View>
          </>
        ) : (
          <Text style={{
            fontFamily: 'Inter',
            fontSize: 14,
            color: colors.onSurfaceVariant,
            textAlign: 'center',
            paddingVertical: spacing.lg,
          }}>
            {!isGoogleConnected
              ? 'Connect your Google account to export data.'
              : 'Link a spreadsheet to start exporting.'}
          </Text>
        )}

        {/* CSV Export / Import */}
        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
          <Button
            title="Export CSV"
            onPress={handleCsvExport}
            variant="secondary"
            icon={<MaterialIcons name="file-download" size={18} color={colors.primary} />}
            style={{ flex: 1 }}
          />
          <Button
            title="Import CSV"
            onPress={() => setShowCsvImport(!showCsvImport)}
            variant="secondary"
            icon={<MaterialIcons name="file-upload" size={18} color={colors.primary} />}
            style={{ flex: 1 }}
          />
        </View>

        {showCsvImport && (
          <View style={{ marginTop: spacing.md }}>
            <TextInput
              style={{
                backgroundColor: colors.surfaceContainerHighest,
                borderRadius: radius.lg,
                padding: spacing.md,
                fontSize: 12,
                fontFamily: 'monospace',
                color: colors.onSurface,
                marginBottom: spacing.sm,
                minHeight: 100,
                textAlignVertical: 'top',
              }}
              placeholder="Paste CSV content here...\n\nExpected format:\nfull_name,contact_number,...\nJohn Doe,555-1234,..."
              placeholderTextColor={colors.outlineVariant}
              value={csvImportText}
              onChangeText={setCsvImportText}
              multiline
              numberOfLines={4}
            />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button
                title={csvImporting ? 'Importing...' : 'Import Members'}
                onPress={handleCsvImport}
                disabled={csvImporting}
                variant="primary"
                style={{ flex: 1 }}
              />
              <Button
                title="Cancel"
                onPress={() => { setShowCsvImport(false); setCsvImportText(''); }}
                variant="secondary"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}

        {/* Support */}
        <SectionTitle title="SUPPORT" colors={colors} spacing={spacing} />
        <Card>
          <SettingRow
            label="Report an Issue"
            colors={colors}
            spacing={spacing}
            onPress={() => {
              Linking.openURL('mailto:support@quickcheck.com?subject=QuickCheck Issue Report&body=Please describe your issue here...');
            }}
            rightElement={
              <MaterialIcons name="bug-report" size={18} color={colors.onSurfaceVariant} />
            }
          />
        </Card>

        {/* Log Out */}
        <View style={{ marginTop: spacing['3xl'] }}>
          <Button
            title="Log Out of Google & Clear Data"
            onPress={handleLogout}
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
          QuickCheck v1.0.0 (Build 1) • Local-First
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};