// MainTabs — Bottom tab navigator matching the Stitch mockup
import React from 'react';
import { View, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../shared/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardScreen } from '../../features/dashboard/screens/DashboardScreen';
import { MemberListScreen } from '../../features/members/screens/MemberListScreen';
import { EventsScreen } from '../../features/events/screens/EventsScreen';
import { CalendarScreen } from '../../features/events/screens/CalendarScreen';
import { ReportsScreen } from '../../features/dashboard/screens/ReportsScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const tabConfig: Array<{
  name: keyof MainTabParamList;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  component: React.ComponentType<any>;
}> = [
  { name: 'Dashboard', label: 'Dashboard', icon: 'dashboard', component: DashboardScreen },
  { name: 'Members', label: 'Members', icon: 'group', component: MemberListScreen },
  { name: 'Events', label: 'Events', icon: 'event', component: EventsScreen },
  { name: 'Calendar', label: 'Calendar', icon: 'calendar-month', component: CalendarScreen },
  { name: 'Reports', label: 'Reports', icon: 'assessment', component: ReportsScreen },
];

export const MainTabs: React.FC = () => {
  const { theme } = useTheme();
  const { colors, shadows, radius } = theme;
  const insets = useSafeAreaInsets();

  const bottomPadding = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 24 : 12);
  const barHeight = (Platform.OS === 'ios' ? 64 : 60) + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainer, // Contrasts with system nav bar
          borderTopWidth: 0, // No-Line Rule
          paddingBottom: bottomPadding,
          paddingTop: 8,
          height: barHeight,
          ...shadows.lg,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarLabelStyle: {
          fontFamily: 'Inter-SemiBold',
          fontSize: 10,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginTop: 2,
        },
      }}
    >
      {tabConfig.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({ color, focused }) => (
              <View style={focused ? {
                backgroundColor: colors.primary,
                borderRadius: 20,
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              } : {
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <MaterialIcons
                  name={tab.icon}
                  size={24}
                  color={focused ? colors.onPrimary : color}
                />
              </View>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};