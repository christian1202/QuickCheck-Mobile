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
import { LoginScreen as LoginScreenComponent } from '../../features/auth/screens/LoginScreen';
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
  const { isAuthenticated, isInitialized } = useAuth();

  // Show a loading indicator while checking auth state
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
      initialRouteName={isAuthenticated ? 'Main' : 'Splash'}
    >
      <Stack.Screen name="Splash" component={SplashScreenComponent} />
      <Stack.Screen name="Login" component={LoginScreenComponent} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="QuickMark" component={QuickMarkScreen} />
      <Stack.Screen name="AddEditMember" component={AddEditMemberScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="MemberReport" component={MemberReportScreen} />
      <Stack.Screen name="AbsenceReport" component={AbsenceReportScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};