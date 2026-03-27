// RootNavigator — Stack navigation: Splash → Login → Main + modal screens
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { MainTabs } from './MainTabs';
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { QuickMarkScreen } from '../screens/QuickMarkScreen';
import { AddEditMemberScreen } from '../screens/AddEditMemberScreen';
import { CreateEventScreen } from '../screens/CreateEventScreen';
import { MemberReportScreen } from '../screens/MemberReportScreen';
import { AbsenceReportScreen } from '../screens/AbsenceReportScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash">
        {({ navigation }) => (
          <SplashScreen
            onGetStarted={() => navigation.replace('Main')}
            onLogin={() => navigation.navigate('Login')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Login">
        {({ navigation }) => (
          <LoginScreen onLogin={() => navigation.replace('Main')} />
        )}
      </Stack.Screen>
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
