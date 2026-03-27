// LoginScreen — Authentication screen matching the Stitch mockup
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';
import { Button, Input } from '../components/ui';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { theme } = useTheme();
  const { colors, spacing, radius, shadows } = theme;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: spacing['2xl'],
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Logo */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing['3xl'],
            gap: spacing.md,
          }}>
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 44,
                height: 44,
                borderRadius: radius.lg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="check-circle" size={24} color={colors.white} />
            </LinearGradient>
            <Text style={{
              fontFamily: 'Manrope-Bold',
              fontSize: 24,
              color: colors.primary,
              letterSpacing: -0.8,
            }}>
              QuickCheck
            </Text>
          </View>

          {/* Login Card */}
          <View style={{
            backgroundColor: colors.surfaceContainerLowest,
            borderRadius: radius['2xl'],
            padding: spacing['3xl'],
            ...shadows.md,
          }}>
            <Text style={{
              fontFamily: 'Manrope-Bold',
              fontSize: 28,
              color: colors.onSurface,
              textAlign: 'center',
              marginBottom: spacing.sm,
            }}>
              Welcome back
            </Text>
            <Text style={{
              fontFamily: 'Inter',
              fontSize: 15,
              color: colors.onSurfaceVariant,
              textAlign: 'center',
              marginBottom: spacing['3xl'],
            }}>
              Please enter your details to continue.
            </Text>

            {/* Email Input */}
            <Input
              label="EMAIL ADDRESS"
              value={email}
              onChangeText={setEmail}
              placeholder="name@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<MaterialIcons name="mail-outline" size={20} color={colors.outlineVariant} />}
            />

            {/* Password Input */}
            <View>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.sm,
              }}>
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 10,
                  letterSpacing: 1.6,
                  textTransform: 'uppercase',
                  color: colors.onSurfaceVariant,
                }}>
                  PASSWORD
                </Text>
                <TouchableOpacity>
                  <Text style={{
                    fontFamily: 'Inter-SemiBold',
                    fontSize: 10,
                    letterSpacing: 1.6,
                    textTransform: 'uppercase',
                    color: colors.primary,
                  }}>
                    FORGOT?
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{
                backgroundColor: colors.surfaceContainerHighest,
                borderRadius: radius.lg,
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: spacing.lg,
                marginBottom: spacing['2xl'],
              }}>
                <View style={{
                  flex: 1,
                  paddingVertical: 16,
                }}>
                  <Text style={{
                    fontFamily: 'Inter',
                    fontSize: 16,
                    color: colors.onSurface,
                    letterSpacing: 4,
                  }}>
                    {password ? '•'.repeat(password.length) : ''}
                  </Text>
                  {!password && (
                    <Text style={{
                      fontFamily: 'Inter',
                      fontSize: 16,
                      color: colors.outlineVariant,
                      position: 'absolute',
                      top: 16,
                    }}>
                      ••••••••
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? 'lock-open' : 'lock-outline'}
                    size={20}
                    color={colors.outlineVariant}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <Button
              title="Log In"
              onPress={onLogin}
              variant="primary"
              size="lg"
              fullWidth
              iconRight={<MaterialIcons name="arrow-forward" size={20} color={colors.white} />}
            />

            {/* Divider */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: spacing['2xl'],
              gap: spacing.md,
            }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.outlineVariant, opacity: 0.3 }} />
              <Text style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 10,
                letterSpacing: 1.6,
                color: colors.outlineVariant,
              }}>
                OR ACCESS WITH
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.outlineVariant, opacity: 0.3 }} />
            </View>

            {/* Biometric Options */}
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <TouchableOpacity style={{
                flex: 1,
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: radius.xl,
                paddingVertical: spacing.lg,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
              }}>
                <MaterialIcons name="fingerprint" size={22} color={colors.primary} />
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 11,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: colors.onSurface,
                }}>
                  Touch ID
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={{
                flex: 1,
                backgroundColor: colors.surfaceContainerLow,
                borderRadius: radius.xl,
                paddingVertical: spacing.lg,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
              }}>
                <MaterialIcons name="face" size={22} color={colors.primary} />
                <Text style={{
                  fontFamily: 'Inter-SemiBold',
                  fontSize: 11,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: colors.onSurface,
                }}>
                  Face ID
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Admin */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: spacing['3xl'],
            gap: spacing.xs,
          }}>
            <Text style={{
              fontFamily: 'Inter',
              fontSize: 14,
              color: colors.onSurfaceVariant,
            }}>
              Don't have an account?
            </Text>
            <TouchableOpacity>
              <Text style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 14,
                color: colors.primary,
              }}>
                Contact Administrator
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={{
            alignItems: 'center',
            paddingVertical: spacing['3xl'],
            gap: spacing.sm,
          }}>
            <Text style={{
              fontFamily: 'Inter-SemiBold',
              fontSize: 10,
              letterSpacing: 1.6,
              color: colors.outlineVariant,
            }}>
              © 2026 QUICKCHECK INC. SECURE PORTAL
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing['2xl'] }}>
              <Text style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 10,
                letterSpacing: 1.2,
                color: colors.outlineVariant,
              }}>
                PRIVACY POLICY
              </Text>
              <Text style={{
                fontFamily: 'Inter-SemiBold',
                fontSize: 10,
                letterSpacing: 1.2,
                color: colors.outlineVariant,
              }}>
                TERMS OF SERVICE
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
