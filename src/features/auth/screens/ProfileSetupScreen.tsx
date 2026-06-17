import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/theme';
import { Button, Input } from '../../../shared/ui';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { useDI } from '../../../core/di/container';
import { database, usersCollection } from '../../../core/database';

export const ProfileSetupScreen: React.FC = () => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const { user } = useAuth();
  const { logger } = useDI();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !user) return;
    setIsLoading(true);
    try {
      // Update the user in WatermelonDB
      const record = await usersCollection.find(user.id);
      await database.write(async () => {
        await record.update((r: any) => {
          r.fullName = name.trim();
        });
      });
      logger.info('ProfileSetup', 'Updated display name', { id: user.id });
      
      // Update the Auth Store so RootNavigator triggers the Main redirect
      const { setUser } = useAuthStore.getState();
      setUser({ ...user, fullName: name.trim() });
    } catch (error) {
      logger.error('ProfileSetup', 'Failed to update name', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: spacing['2xl'],
            justifyContent: 'center',
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: 'center', marginBottom: spacing['3xl'] }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.xl,
            }}>
              <MaterialIcons name="person" size={40} color={colors.primary} />
            </View>
            <Text style={{
              fontFamily: 'Manrope-Bold',
              fontSize: 28,
              color: colors.onSurface,
              textAlign: 'center',
              marginBottom: spacing.sm,
            }}>
              Welcome to QuickCheck!
            </Text>
            <Text style={{
              fontFamily: 'Inter',
              fontSize: 16,
              color: colors.onSurfaceVariant,
              textAlign: 'center',
            }}>
              What should we call you?
            </Text>
          </View>

          <View style={{ gap: spacing.lg, marginBottom: spacing['3xl'] }}>
            <Input
              label="Your Name or Role"
              placeholder="e.g. Secretary Jane"
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>

          <Button
            title="Continue to Dashboard"
            onPress={handleSave}
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={!name.trim()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
