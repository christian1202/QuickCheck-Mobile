// AddEditMemberScreen — Member form matching the Stitch mockup
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Avatar, Input, Button, Card, FilterChips } from '../components/ui';
import { MOCK_MEMBERS } from '../data/mockData';

export const AddEditMemberScreen: React.FC<{ navigation?: any; route?: any }> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, shadows } = theme;
  const memberId = route?.params?.memberId;
  const existingMember = memberId ? MOCK_MEMBERS.find(m => m.id === memberId) : null;
  const isEditing = !!existingMember;

  const [fullName, setFullName] = useState(existingMember?.full_name ?? '');
  const [contactNumber, setContactNumber] = useState(existingMember?.contact_number ?? '');
  const [birthday, setBirthday] = useState(existingMember?.birthday ?? '');
  const [memberSince, setMemberSince] = useState(existingMember?.member_since ?? '');
  const [role, setRole] = useState(existingMember?.role_in_church ?? '');
  const [ministryGroup, setMinistryGroup] = useState(existingMember?.ministry_group ?? '');
  const [emergencyContact, setEmergencyContact] = useState(existingMember?.emergency_contact ?? '');
  const [status, setStatus] = useState(existingMember?.status ?? 'active');

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
                uri={existingMember?.photo_url}
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
              selected={status === 'active' ? 'Active' : status === 'inactive' ? 'Inactive' : status === 'on_leave' ? 'On Leave' : 'Transferred'}
              onSelect={(opt) => {
                const map: Record<string, string> = { 'Active': 'active', 'Inactive': 'inactive', 'On Leave': 'on_leave', 'Transferred': 'transferred' };
                setStatus(map[opt] as any);
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
          title={isEditing ? 'Save Member Profile' : 'Add Member'}
          onPress={() => navigation?.goBack()}
          variant="primary"
          style={{ flex: 2 }}
        />
      </View>
    </SafeAreaView>
  );
};
