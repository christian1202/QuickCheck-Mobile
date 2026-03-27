// MainTabs — Bottom tab navigator matching the Stitch mockup
import React from 'react';
import { View, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { DashboardScreen } from '../screens/DashboardScreen';
import { MemberListScreen } from '../screens/MemberListScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
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

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLowest + 'CC', // 80% opacity per glassmorphism
          borderTopWidth: 0, // No-Line Rule
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 88 : 72,
          position: 'absolute',
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
                backgroundColor: colors.primaryContainer,
                borderRadius: radius.xl,
                paddingHorizontal: 14,
                paddingVertical: 4,
              } : undefined}>
                <MaterialIcons
                  name={tab.icon}
                  size={24}
                  color={focused ? colors.white : color}
                />
              </View>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};
