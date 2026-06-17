// AddEditMemberScreen — Member form matching the Stitch mockup
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/theme';
import { Avatar, Input, Button, Card, FilterChips } from '../../../shared/ui';
import { useMembers } from '..';
import type { MemberStatus } from '../../../core/types/domain';

const STATUS_DISPLAY_MAP: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  on_leave: 'On Leave',
  transferred: 'Transferred',
};

const STATUS_VALUE_MAP: Record<string, MemberStatus> = {
  'Active': 'active',
  'Inactive': 'inactive',
  'On Leave': 'on_leave',
  'Transferred': 'transferred',
};

export const AddEditMemberScreen: React.FC<{ navigation?: any; route?: any }> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, shadows } = theme;
  const { selectedMember, createMember, updateMember } = useMembers();
  const memberId = route?.params?.memberId;
  const isEditing = !!memberId;

  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [birthday, setBirthday] = useState('');
  const [memberSince, setMemberSince] = useState('');
  const [role, setRole] = useState('');
  const [ministryGroup, setMinistryGroup] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [status, setStatus] = useState<MemberStatus>('active');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (memberId && selectedMember) {
      setFullName(selectedMember.full_name ?? '');
      setContactNumber(selectedMember.contact_number ?? '');
      setBirthday(selectedMember.birthday ?? '');
      setMemberSince(selectedMember.member_since ?? '');
      setRole(selectedMember.role_in_church ?? '');
      setMinistryGroup(selectedMember.ministry_group ?? '');
      setEmergencyContact(selectedMember.emergency_contact ?? '');
      setStatus(selectedMember.status ?? 'active');
    }
  }, [memberId, selectedMember]);

  const handleSave = useCallback(async () => {
    if (!fullName.trim()) return;
    setSaving(true);
    try {
      const memberData = {
        full_name: fullName,
        contact_number: contactNumber,
        birthday,
        member_since: memberSince,
        role_in_church: role,
        ministry_group: ministryGroup,
        emergency_contact: emergencyContact,
        status,
      };

      if (isEditing && memberId) {
        await updateMember(memberId, memberData);
      } else {
        await createMember(memberData as Parameters<typeof createMember>[0]);
      }
      navigation?.goBack();
    } catch (_error: unknown) {
      // Save failed — error is handled by the store's error state
    } finally {
      setSaving(false);
    }
  }, [fullName, contactNumber, birthday, memberSince, role, ministryGroup, emergencyContact, status, isEditing, memberId, updateMember, createMember, navigation]);

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
        <Text style={{
          fontFamily: 'Manrope-Bold',
          fontSize: 22,
          color: colors.primary,
          flex: 1,
        }}>
          {isEditing ? 'Edit Member' : 'Add Member'}
        </Text>
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
          {/* Avatar */}
          <View style={{ alignItems: 'center', marginVertical: spacing['2xl'] }}>
            <TouchableOpacity>
              <Avatar
                uri={selectedMember?.photo_url}
                name={fullName || 'New Member'}
                size={96}
              />
              <View style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: colors.background,
              }}>
                <MaterialIcons name="camera-alt" size={14} color={colors.white} />
              </View>
            </TouchableOpacity>
            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 10,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: colors.onSurfaceVariant,
              marginTop: spacing.md,
            }}>
              TAP TO CHANGE PHOTO
            </Text>
          </View>

          {/* Personal Identity */}
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 10,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: colors.onSurfaceVariant,
            marginBottom: spacing.lg,
          }}>
            PERSONAL IDENTITY
          </Text>
          <Card style={{ marginBottom: spacing['2xl'] }}>
            <Input label="FULL NAME" value={fullName} onChangeText={setFullName} placeholder="Enter full name" />
            <Input label="CONTACT NUMBER" value={contactNumber} onChangeText={setContactNumber} placeholder="+1 (555) 000-0000" keyboardType="phone-pad" />
            <Input label="BIRTHDAY" value={birthday} onChangeText={setBirthday} placeholder="YYYY-MM-DD"
              icon={<MaterialIcons name="calendar-today" size={18} color={colors.outlineVariant} />}
            />
            <Input label="MEMBER SINCE" value={memberSince} onChangeText={setMemberSince} placeholder="YYYY-MM-DD"
              icon={<MaterialIcons name="calendar-today" size={18} color={colors.outlineVariant} />}
            />
          </Card>

          {/* Ministry Details */}
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 10,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: colors.onSurfaceVariant,
            marginBottom: spacing.lg,
          }}>
            MINISTRY DETAILS
          </Text>
          <Card style={{ marginBottom: spacing['2xl'] }}>
            <Input label="ROLE IN CHURCH" value={role} onChangeText={setRole} placeholder="e.g. Youth Leader" />
            <Input label="MINISTRY GROUP" value={ministryGroup} onChangeText={setMinistryGroup} placeholder="Select or type ministry group"
              icon={<MaterialIcons name="expand-more" size={18} color={colors.outlineVariant} />}
            />

            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 10,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: colors.onSurfaceVariant,
              marginBottom: spacing.md,
            }}>
              MEMBER STATUS
            </Text>
            <FilterChips
              options={['Active', 'Inactive', 'On Leave', 'Transferred']}
              selected={STATUS_DISPLAY_MAP[status] ?? 'Active'}
              onSelect={(opt) => {
                const mapped = STATUS_VALUE_MAP[opt];
                if (mapped) {
                  setStatus(mapped);
                }
              }}
            />
          </Card>

          {/* Safety & Contact */}
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 10,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: colors.onSurfaceVariant,
            marginBottom: spacing.lg,
          }}>
            SAFETY & CONTACT
          </Text>
          <Card>
            <Input label="EMERGENCY CONTACT" value={emergencyContact} onChangeText={setEmergencyContact} placeholder="Name - Phone Number" />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Actions */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing.lg,
        paddingBottom: spacing['3xl'],
        flexDirection: 'row',
        gap: spacing.md,
        ...shadows.lg,
      }}>
        <Button
          title="Discard"
          onPress={() => navigation?.goBack()}
          variant="ghost"
          style={{ flex: 1 }}
        />
        <Button
          title={saving ? 'Saving...' : isEditing ? 'Save Member Profile' : 'Add Member'}
          onPress={handleSave}
          variant="primary"
          disabled={saving}
          style={{ flex: 2 }}
        />
      </View>
    </SafeAreaView>
  );
};
