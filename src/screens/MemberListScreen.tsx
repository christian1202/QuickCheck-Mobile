// MemberListScreen — Member directory matching the Stitch mockup
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { SearchBar, FilterChips, Avatar, StatusChip, ProgressBar, FAB, Card } from '../components/ui';
import { MOCK_MEMBERS, MOCK_MINISTRY_GROUPS } from '../data/mockData';

export const MemberListScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, shadows } = theme;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All Ministry Groups');

  const filteredMembers = useMemo(() => {
    let members = MOCK_MEMBERS;
    if (search) {
      const q = search.toLowerCase();
      members = members.filter(m =>
        m.full_name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') {
      const status = statusFilter.toLowerCase().replace(' ', '_');
      members = members.filter(m => m.status === status);
    }
    return members;
  }, [search, statusFilter]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing.lg,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Avatar name="Sarah Martinez" size={36} />
          <Text style={{
            fontFamily: 'Manrope-Bold',
            fontSize: 20,
            color: colors.primaryContainer,
            letterSpacing: -0.5,
          }}>
            QuickCheck
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <TouchableOpacity style={{ padding: spacing.sm }}>
            <MaterialIcons name="wifi-off" size={22} color={colors.primaryContainer} />
          </TouchableOpacity>
          <TouchableOpacity style={{ padding: spacing.sm }}>
            <MaterialIcons name="notifications-none" size={22} color={colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: spacing['2xl'], marginBottom: spacing.md }}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search members by name or ID..."
        />
      </View>

      {/* Group Filter */}
      <View style={{
        paddingHorizontal: spacing['2xl'],
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
      }}>
        <MaterialIcons name="tune" size={20} color={colors.onSurfaceVariant} />
        <TouchableOpacity style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        }}>
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 13,
            color: colors.onSurface,
          }}>
            {groupFilter}
          </Text>
          <MaterialIcons name="expand-more" size={18} color={colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Status Filters */}
      <View style={{ paddingHorizontal: spacing['2xl'], marginBottom: spacing.lg }}>
        <FilterChips
          options={['All', 'Active', 'Inactive', 'On Leave']}
          selected={statusFilter}
          onSelect={setStatusFilter}
        />
      </View>

      {/* Member List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing['2xl'],
          paddingBottom: 120,
          gap: spacing.lg, // Anti-divider policy: spacing instead of lines
        }}
      >
        {filteredMembers.map((member) => (
          <TouchableOpacity
            key={member.id}
            activeOpacity={0.7}
            onPress={() => navigation?.navigate('MemberReport', { memberId: member.id })}
          >
            <Card variant="default" style={{ alignItems: 'center', paddingVertical: spacing['2xl'] }}>
              {/* Three-dot menu */}
              <TouchableOpacity style={{
                position: 'absolute',
                top: spacing.md,
                right: spacing.md,
                padding: spacing.xs,
              }}>
                <MaterialIcons name="more-vert" size={20} color={colors.onSurfaceVariant} />
              </TouchableOpacity>

              {/* Avatar */}
              <Avatar
                uri={member.photo_url}
                name={member.full_name}
                size={72}
                showStatusRing
                statusColor={
                  member.status === 'active' ? colors.secondary :
                  member.status === 'inactive' ? colors.outlineVariant :
                  colors.onTertiaryContainer
                }
              />

              {/* Name */}
              <Text style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 16,
                color: colors.onSurface,
                marginTop: spacing.md,
              }}>
                {member.full_name}
              </Text>

              {/* Ministry Group Tag */}
              <View style={{
                backgroundColor: colors.surfaceContainerHigh,
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 9999,
                marginTop: spacing.xs,
              }}>
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 10,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: colors.primary,
                }}>
                  {member.ministry_group}
                </Text>
              </View>

              {/* Attendance bar + Status */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                marginTop: spacing.lg,
              }}>
                <View style={{ flex: 1, marginRight: spacing.lg }}>
                  <Text style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 10,
                    letterSpacing: 1.6,
                    textTransform: 'uppercase',
                    color: colors.onSurfaceVariant,
                    marginBottom: 4,
                  }}>
                    Attendance
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{
                      fontFamily: 'Inter-SemiBold',
                      fontSize: 14,
                      color: (member.attendance_rate ?? 0) < 70 ? colors.error : colors.secondary,
                    }}>
                      {member.attendance_rate ?? 0}%
                    </Text>
                    <ProgressBar
                      progress={member.attendance_rate ?? 0}
                      color={(member.attendance_rate ?? 0) < 70 ? colors.error : colors.secondary}
                      height={4}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
                {member.latest_status && (
                  <StatusChip status={member.latest_status} size="sm" />
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAB */}
      <FAB
        onPress={() => navigation?.navigate('AddEditMember')}
        icon="add"
      />
    </SafeAreaView>
  );
};
