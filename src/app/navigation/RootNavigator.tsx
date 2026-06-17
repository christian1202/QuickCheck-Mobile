// RootNavigator — Auth-gated stack navigation:
//   Splash → Login → Main + modal screens
//
// Flow:
//   - If not initialized → show loading
//   - If initialized & not authenticated → Splash → Login → Main
//   - If initialized & authenticated → Main directly
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../../shared/theme';
import { useAuth } from '../../features/auth';
import { MainTabs } from './MainTabs';
import { SplashScreen as SplashScreenComponent } from '../../features/auth/screens/SplashScreen';
import { TutorialScreen } from '../../features/auth/screens/TutorialScreen';
import { ProfileSetupScreen } from '../../features/auth/screens/ProfileSetupScreen';
import { QuickMarkScreen } from '../../features/attendance/screens/QuickMarkScreen';
import { AddEditMemberScreen } from '../../features/members/screens/AddEditMemberScreen';
import { CreateEventScreen } from '../../features/events/screens/CreateEventScreen';
import { MemberReportScreen } from '../../features/members/screens/MemberReportScreen';
import { AbsenceReportScreen } from '../../features/dashboard/screens/AbsenceReportScreen';
import { SettingsScreen } from '../../features/settings/screens/SettingsScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { isAuthenticated, isInitialized, user } = useAuth();

  // Show a loading indicator while checking auth state
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const needsProfileSetup = isAuthenticated && user?.fullName === 'Google User';

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Splash" component={SplashScreenComponent} />
          <Stack.Screen name="Tutorial" component={TutorialScreen} />
        </>
      ) : needsProfileSetup ? (
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="QuickMark" component={QuickMarkScreen} />
          <Stack.Screen name="AddEditMember" component={AddEditMemberScreen} />
          <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
          <Stack.Screen name="MemberReport" component={MemberReportScreen} />
          <Stack.Screen name="AbsenceReport" component={AbsenceReportScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};