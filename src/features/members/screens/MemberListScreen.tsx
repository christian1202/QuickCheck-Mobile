// MemberListScreen — Member directory
// Uses useMembers() hook — reads from WatermelonDB via DI
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../../shared/theme';
import { SearchBar, FilterChips, Avatar, StatusChip, ProgressBar, FAB, Card, EmptyState } from '../../../shared/ui';
import { useMembers } from '..';
import type { MemberStatus } from '../../../core/types/domain';

export const MemberListScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors, spacing } = theme;
  const { members, fetchMembers, setFilters } = useMembers();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  useEffect(() => {
    const status: MemberStatus | undefined = statusFilter !== 'All'
      ? statusFilter.toLowerCase().replace(' ', '_') as MemberStatus
      : undefined;
    setFilters({ status, search: search || undefined });
  }, [statusFilter, search, setFilters]);

  const filteredMembers = members.filter(m => {
    const full = `${m.first_name} ${m.last_name}`.toLowerCase();
    return !search || full.includes(search.toLowerCase());
  });

  const handleMemberPress = useCallback((memberId: string) => {
    navigation?.navigate('MemberReport', { memberId });
  }, [navigation]);

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
          <View style={{ padding: spacing.sm }}>
            <MaterialIcons name="wifi-off" size={22} color={colors.primaryContainer} />
          </View>
          <View style={{ padding: spacing.sm }}>
            <MaterialIcons name="notifications-none" size={22} color={colors.onSurfaceVariant} />
          </View>
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
        }}
      >
        {filteredMembers.length === 0 ? (
          <EmptyState
            iconName="group-off"
            title="No members found"
            message={search ? `No results for "${search}"` : "Get started by adding your first church member."}
          />
        ) : (
          filteredMembers.map((member: any, index: number) => (
            <Animated.View key={member.id} entering={FadeInDown.delay(index * 50).springify()}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleMemberPress(member.id)}
                style={{ marginBottom: spacing.lg }}
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
                    name={`${member.first_name} ${member.last_name}`}
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
                    {member.first_name} {member.last_name}
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
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <FAB
        onPress={() => navigation?.navigate('AddEditMember')}
        icon="add"
      />
    </SafeAreaView>
  );
};
