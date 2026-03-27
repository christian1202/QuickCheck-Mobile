// AbsenceReportScreen — Absence filing form matching the Stitch mockup
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { Avatar, Card, StatusChip, Button } from '../components/ui';
import { MOCK_MEMBERS } from '../data/mockData';

type ReasonCategory = 'health' | 'work' | 'family' | 'travel' | 'no_response' | 'other';

export const AbsenceReportScreen: React.FC<{ navigation?: any; route?: any }> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, shadows } = theme;
  const member = MOCK_MEMBERS[1]; // Sarah Jenkins (absent member)
  const [selectedReason, setSelectedReason] = useState<ReasonCategory | null>(null);
  const [explanation, setExplanation] = useState('');
  const [statusOverride, setStatusOverride] = useState<'excused' | 'unexcused' | 'under_review'>('under_review');
  const [secretaryNote, setSecretaryNote] = useState('');

  const reasonCategories: { key: ReasonCategory; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
    { key: 'health', label: 'Health', icon: 'local-hospital' },
    { key: 'work', label: 'Work', icon: 'work' },
    { key: 'family', label: 'Family', icon: 'family-restroom' },
    { key: 'travel', label: 'Travel', icon: 'flight' },
    { key: 'no_response', label: 'No Resp.', icon: 'phone-disabled' },
    { key: 'other', label: 'Other', icon: 'more-horiz' },
  ];

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
            REPORTS {'>'} ABSENCE FILING
          </Text>
          <Text style={{
            fontFamily: 'Manrope-Bold',
            fontSize: 22,
            color: colors.primary,
          }}>
            Absence Report
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing['2xl'],
          paddingBottom: 120,
        }}
      >
        {/* Member Info */}
        <Card style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.lg,
          marginBottom: spacing['2xl'],
        }}>
          <Avatar uri={member.photo_url} name={member.full_name} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 16,
              color: colors.onSurface,
            }}>
              {member.full_name}
            </Text>
            <Text style={{
              fontFamily: 'Inter',
              fontSize: 12,
              color: colors.onSurfaceVariant,
              marginTop: 2,
            }}>
              Weekly Youth Seminar • Oct 24, 2024
            </Text>
          </View>
          <StatusChip status="absent" />
        </Card>

        {/* Reason Category Grid */}
        <Text style={{
          fontFamily: 'Inter-SemiBold',
          fontSize: 10,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: colors.onSurfaceVariant,
          marginBottom: spacing.md,
        }}>
          REASON CATEGORY
        </Text>
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.md,
          marginBottom: spacing['2xl'],
        }}>
          {reasonCategories.map(cat => {
            const isActive = selectedReason === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setSelectedReason(cat.key)}
                style={{
                  width: '30.5%',
                  backgroundColor: isActive ? colors.primaryContainer : colors.surfaceContainerLow,
                  borderRadius: radius.xl,
                  padding: spacing.lg,
                  alignItems: 'center',
                  gap: spacing.sm,
                  borderWidth: isActive ? 2 : 0,
                  borderColor: colors.primary,
                }}
              >
                <MaterialIcons
                  name={cat.icon}
                  size={24}
                  color={isActive ? colors.white : colors.primary}
                />
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 11,
                  color: isActive ? colors.white : colors.onSurface,
                  textAlign: 'center',
                }}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Detailed Explanation */}
        <Text style={{
          fontFamily: 'Inter-SemiBold',
          fontSize: 10,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: colors.onSurfaceVariant,
          marginBottom: spacing.md,
        }}>
          DETAILED EXPLANATION
        </Text>
        <View style={{
          backgroundColor: colors.surfaceContainerHighest,
          borderRadius: radius.lg,
          padding: spacing.lg,
          marginBottom: spacing['2xl'],
        }}>
          <TextInput
            value={explanation}
            onChangeText={setExplanation}
            placeholder="Provide details about the absence..."
            placeholderTextColor={colors.outlineVariant}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{
              fontFamily: 'Inter',
              fontSize: 15,
              color: colors.onSurface,
              minHeight: 100,
            }}
          />
        </View>

        {/* Proof Attachment */}
        <Text style={{
          fontFamily: 'Inter-SemiBold',
          fontSize: 10,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: colors.onSurfaceVariant,
          marginBottom: spacing.md,
        }}>
          PROOF ATTACHMENT
        </Text>
        <TouchableOpacity style={{
          backgroundColor: colors.surfaceContainerLow,
          borderRadius: radius.xl,
          borderWidth: 2,
          borderColor: colors.outlineVariant + '30',
          borderStyle: 'dashed',
          padding: spacing['2xl'],
          alignItems: 'center',
          marginBottom: spacing['2xl'],
        }}>
          <MaterialIcons name="cloud-upload" size={32} color={colors.outlineVariant} />
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 14,
            color: colors.primary,
            marginTop: spacing.sm,
          }}>
            Upload Files
          </Text>
          <Text style={{
            fontFamily: 'Inter',
            fontSize: 11,
            color: colors.onSurfaceVariant,
            marginTop: spacing.xs,
          }}>
            PNG, JPG, PDF up to 10MB
          </Text>
        </TouchableOpacity>

        {/* Status Override */}
        <Text style={{
          fontFamily: 'Inter-SemiBold',
          fontSize: 10,
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          color: colors.onSurfaceVariant,
          marginBottom: spacing.md,
        }}>
          STATUS OVERRIDE
        </Text>
        <View style={{
          flexDirection: 'row',
          gap: spacing.md,
          marginBottom: spacing['2xl'],
        }}>
          {(['excused', 'unexcused', 'under_review'] as const).map(opt => {
            const isActive = statusOverride === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => setStatusOverride(opt)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  borderRadius: radius.xl,
                  backgroundColor: isActive ? colors.primary : colors.surfaceContainerLow,
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 11,
                  letterSpacing: 0.5,
                  color: isActive ? colors.white : colors.onSurfaceVariant,
                  textTransform: 'capitalize',
                }}>
                  {opt.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Secretary Note */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.sm,
          marginBottom: spacing.md,
        }}>
          <Text style={{
            fontFamily: 'Inter-SemiBold',
            fontSize: 10,
            letterSpacing: 1.6,
            textTransform: 'uppercase',
            color: colors.onSurfaceVariant,
          }}>
            INTERNAL SECRETARY NOTE
          </Text>
          <View style={{
            backgroundColor: colors.errorContainer,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
          }}>
            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 8,
              letterSpacing: 1,
              color: colors.onErrorContainer,
            }}>
              PRIVATE
            </Text>
          </View>
        </View>
        <View style={{
          backgroundColor: colors.surfaceContainerHighest,
          borderRadius: radius.lg,
          padding: spacing.lg,
          marginBottom: spacing['2xl'],
        }}>
          <TextInput
            value={secretaryNote}
            onChangeText={setSecretaryNote}
            placeholder="Add internal notes..."
            placeholderTextColor={colors.outlineVariant}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{
              fontFamily: 'Inter',
              fontSize: 15,
              color: colors.onSurface,
              minHeight: 80,
            }}
          />
        </View>

        {/* Bottom Actions */}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Button
            title="Reject"
            onPress={() => navigation?.goBack()}
            variant="destructive"
            style={{ flex: 1 }}
          />
          <Button
            title="Save"
            onPress={() => navigation?.goBack()}
            variant="secondary"
            style={{ flex: 1 }}
          />
          <Button
            title="Approve"
            onPress={() => navigation?.goBack()}
            variant="primary"
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
