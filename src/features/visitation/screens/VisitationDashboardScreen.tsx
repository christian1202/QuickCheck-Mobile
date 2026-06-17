import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/theme';
import { Avatar, SectionHeader } from '../../../shared/ui';
import { useVisitation } from '../hooks/useVisitation';

export const VisitationDashboardScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const { visitationList, isLoading, refresh } = useVisitation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing['2xl'],
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.surfaceContainerHighest,
      }}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={{ padding: spacing.sm, marginLeft: -spacing.sm, marginRight: spacing.md }}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={{
          fontFamily: 'Manrope-Bold',
          fontSize: 20,
          color: colors.onSurface,
        }}>
          Visitation Dashboard
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing['2xl'] }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.primary} />
        }
      >
        <SectionHeader 
          title={`Members Needing Pastoral Visit (${visitationList.length})`}
        />

        {visitationList.length === 0 && !isLoading ? (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing['4xl'],
          }}>
            <MaterialIcons name="check-circle-outline" size={48} color={colors.primary} />
            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 16,
              color: colors.onSurface,
              marginTop: spacing.lg,
              textAlign: 'center',
            }}>
              No visitations needed!
            </Text>
            <Text style={{
              fontFamily: 'Inter',
              fontSize: 14,
              color: colors.onSurfaceVariant,
              marginTop: spacing.xs,
              textAlign: 'center',
            }}>
              All members are attending regularly.
            </Text>
          </View>
        ) : (
          visitationList.map(({ member, absences }) => (
            <TouchableOpacity
              key={member.id}
              onPress={() => navigation?.navigate('MemberReport', { memberId: member.id })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                padding: spacing.lg,
                borderRadius: radius.lg,
                marginBottom: spacing.md,
                borderWidth: 1,
                borderColor: colors.errorContainer,
              }}
            >
              <Avatar uri={member.photo_url} name={member.full_name} size={48} />
              
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 16,
                  color: colors.onSurface,
                }}>
                  {member.full_name}
                </Text>
                <Text style={{
                  fontFamily: 'Inter',
                  fontSize: 14,
                  color: colors.error,
                  marginTop: 2,
                }}>
                  {absences} consecutive absences
                </Text>
              </View>

              <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
