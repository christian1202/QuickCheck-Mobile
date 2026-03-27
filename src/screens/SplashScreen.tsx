// SplashScreen — Onboarding/welcome screen matching the Stitch mockup
import React from 'react';
import { View, Text, ScrollView, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';
import { Button } from '../components/ui';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onGetStarted, onLogin }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, shadows } = theme;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing['2xl'],
          paddingVertical: spacing['4xl'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: spacing['5xl'] }}>
          <LinearGradient
            colors={[colors.primary, colors.primaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 80,
              height: 80,
              borderRadius: radius['2xl'],
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing['2xl'],
              ...shadows.xl,
            }}
          >
            <MaterialIcons name="check-circle" size={40} color={colors.white} />
          </LinearGradient>
          <Text style={{
            fontFamily: 'Manrope-ExtraBold',
            fontSize: 36,
            color: colors.primary,
            letterSpacing: -1.5,
          }}>
            QuickCheck
          </Text>
        </View>

        {/* Value Proposition */}
        <View style={{ alignItems: 'center', marginBottom: spacing['5xl'] }}>
          <Text style={{
            fontFamily: 'Manrope-Bold',
            fontSize: 26,
            color: colors.onSurface,
            textAlign: 'center',
            letterSpacing: -0.5,
            lineHeight: 34,
            marginBottom: spacing.lg,
          }}>
            Attendance, simplified for{'\n'}your congregation
          </Text>
          <Text style={{
            fontFamily: 'Inter',
            fontSize: 16,
            color: colors.onSurfaceVariant,
            textAlign: 'center',
            lineHeight: 24,
            maxWidth: 320,
          }}>
            Manage your community with precision and peace of mind through our tonal, data-first management sanctuary.
          </Text>
        </View>

        {/* CTAs */}
        <View style={{ width: '100%', gap: spacing.md }}>
          <Button
            title="Get Started"
            onPress={onGetStarted}
            variant="primary"
            size="lg"
            fullWidth
          />
          <Button
            title="Log In"
            onPress={onLogin}
            variant="secondary"
            size="lg"
            fullWidth
          />
        </View>

        {/* Footer badges */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: spacing['5xl'],
          gap: spacing.lg,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialIcons name="verified-user" size={14} color={colors.secondary} />
            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 10,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: colors.onSurfaceVariant,
            }}>
              Secure Cloud Data
            </Text>
          </View>
          <View style={{
            width: 4,
            height: 4,
            backgroundColor: colors.outlineVariant,
            borderRadius: 2,
          }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialIcons name="group" size={14} color={colors.secondary} />
            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 10,
              letterSpacing: 1.6,
              textTransform: 'uppercase',
              color: colors.onSurfaceVariant,
            }}>
              1K+ Communities
            </Text>
          </View>
        </View>

        {/* Copyright */}
        <Text style={{
          fontFamily: 'Inter',
          fontSize: 11,
          color: colors.outlineVariant,
          textAlign: 'center',
          marginTop: spacing['3xl'],
          letterSpacing: 0.5,
        }}>
          © 2026 QUICKCHECK SYSTEMS. ALL RIGHTS RESERVED.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};
