// QuickMarkScreen — Attendance marking screen
// Uses useMembers() + useAttendance() hooks — reads from WatermelonDB via DI
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/theme';
import { Avatar, SearchBar, Card, Button } from '../../../shared/ui';
import type { Member } from '../../../core/types/domain';
import { useAttendance } from '..';
import { useMembers } from '../../members';

type MarkStatus = 'present' | 'late' | 'absent' | null;

export const QuickMarkScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const { members, fetchMembers } = useMembers();
  const { submitAttendance } = useAttendance();
  const [search, setSearch] = useState('');
  const [marks, setMarks] = useState<Record<string, MarkStatus>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchMembers(); }, []);

  const markMember = useCallback((memberId: string, status: MarkStatus) => {
    setMarks(prev => ({
      ...prev,
      [memberId]: prev[memberId] === status ? null : status,
    }));
  }, []);

  const markAllPresent = useCallback(() => {
    const allPresent: Record<string, MarkStatus> = {};
    members.forEach(m => { allPresent[m.id] = 'present'; });
    setMarks(allPresent);
  }, [members]);

  const counts = {
    present: Object.values(marks).filter(s => s === 'present').length,
    late: Object.values(marks).filter(s => s === 'late').length,
    absent: Object.values(marks).filter(s => s === 'absent').length,
    unmarked: members.length - Object.values(marks).filter(s => s !== null).length,
  };

  const filteredMembers = members.filter(m =>
    !search || m.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await submitAttendance();
      navigation?.goBack();
    } finally {
      setSubmitting(false);
    }
  };

  const statusButtonConfigs = {
    present: { icon: 'check' as const, label: 'PRES', activeBg: colors.secondaryContainer, activeBorder: colors.secondary },
    late: { icon: 'schedule' as const, label: 'LATE', activeBg: colors.tertiaryFixedDim, activeBorder: colors.onTertiaryContainer },
    absent: { icon: 'close' as const, label: 'ABS', activeBg: colors.errorContainer, activeBorder: colors.error },
  };

  const renderMember = ({ item: member }: { item: Member }) => {
    const status = marks[member.id] || null;

    return (
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
        backgroundColor: colors.surfaceContainerLow,
        borderRadius: radius.xl,
        marginBottom: spacing.md,
      }}>
        <Avatar uri={member.photo_url} name={member.full_name} size={48} />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 15,
            color: colors.onSurface,
          }} numberOfLines={1}>
            {member.full_name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <View style={{
              width: 20, height: 3,
              backgroundColor: (member.attendance_rate ?? 0) >= 70 ? colors.secondary : colors.error,
              borderRadius: 2,
            }} />
            <Text style={{ fontFamily: 'Inter', fontSize: 11, color: colors.onSurfaceVariant }}>
              {member.attendance_rate ?? 0}%
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {(['present', 'late', 'absent'] as const).map((s) => {
            const isActive = status === s;
            const c = statusButtonConfigs[s];
            return (
              <TouchableOpacity
                key={s}
                onPress={() => markMember(member.id, s)}
                style={{
                  width: 52, height: 52, borderRadius: radius.lg,
                  backgroundColor: isActive ? c.activeBg : colors.surfaceContainerLowest,
                  borderWidth: isActive ? 2 : 1,
                  borderColor: isActive ? c.activeBorder : colors.outlineVariant + '30',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <MaterialIcons name={c.icon} size={18} color={isActive ? c.activeBorder : colors.onSurfaceVariant} />
                <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 8, letterSpacing: 0.5, color: isActive ? c.activeBorder : colors.onSurfaceVariant, marginTop: 2 }}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <View style={{ paddingHorizontal: spacing['2xl'], paddingTop: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Avatar name="Secretary" size={36} />
            <Text style={{ fontFamily: 'Manrope-Bold', fontSize: 20, color: colors.primaryContainer, letterSpacing: -0.5 }}>
              QuickCheck
            </Text>
          </View>
        </View>

        <Text style={{ fontFamily: 'Manrope-ExtraBold', fontSize: 28, color: colors.primary, letterSpacing: -0.8, marginTop: spacing['2xl'] }}>
          Quick Mark Attendance
        </Text>
        <Text style={{ fontFamily: 'Inter', fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4 }}>
          Tap each member to mark attendance
        </Text>

        <TouchableOpacity
          onPress={markAllPresent}
          style={{
            backgroundColor: colors.surfaceContainerHigh, borderRadius: radius.xl,
            paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
            flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg,
          }}
        >
          <MaterialIcons name="check-circle" size={22} color={colors.secondary} />
          <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: colors.onSurface }}>
            Mark All Present
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', paddingHorizontal: spacing['2xl'], gap: spacing.md, marginTop: spacing['2xl'], marginBottom: spacing.lg }}>
        {[
          { label: 'PRESENT', count: counts.present, color: colors.secondary },
          { label: 'LATE', count: counts.late, color: colors.onTertiaryContainer },
          { label: 'ABSENT', count: counts.absent, color: colors.error },
          { label: 'UNMARKED', count: counts.unmarked, color: colors.primary },
        ].map(stat => (
          <Card key={stat.label} style={{ flex: 1, padding: spacing.md }}>
            <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.onSurfaceVariant }}>
              {stat.label}
            </Text>
            <Text style={{ fontFamily: 'Manrope-ExtraBold', fontSize: 28, color: stat.color, marginTop: 2 }}>
              {String(stat.count).padStart(2, '0')}
            </Text>
          </Card>
        ))}
      </View>

      <View style={{ paddingHorizontal: spacing['2xl'], marginBottom: spacing.md }}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search members by name..." />
      </View>

      <FlatList
        data={filteredMembers}
        renderItem={renderMember}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing['2xl'], paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      <View style={{ position: 'absolute', bottom: 90, left: spacing['2xl'], right: spacing['2xl'] }}>
        <Button
          title={submitting ? 'Saving...' : 'Finish Session'}
          onPress={handleFinish}
          disabled={submitting}
          variant="primary"
          size="lg"
          fullWidth
          iconRight={<MaterialIcons name="arrow-forward" size={20} color={colors.white} />}
        />
      </View>
    </SafeAreaView>
  );
};