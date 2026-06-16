// ============================================================
// QuickCheck Mobile — App Entry Point
// ============================================================
// Architecture: Feature-Based Clean Architecture
//
// Provider hierarchy:
//   GestureHandlerRootView
//     └─ ErrorBoundary         (catches render errors)
//        └─ DIProvider          (dependency injection)
//           └─ SafeAreaProvider
//              └─ ThemeProvider
//                 └─ AppInitializer  (network, sync, auth init)
//                    └─ NavigationContainer
//                       └─ RootNavigator
// ============================================================

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts as useManrope,
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  useFonts as useInter,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import * as SplashScreenModule from 'expo-splash-screen';
import { AppProviders } from './src/app/AppProviders';

// Prevent auto-hide of splash screen
SplashScreenModule.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [manropeLoaded] = useManrope({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    'Manrope': Manrope_400Regular,
    'Manrope-Bold': Manrope_700Bold,
    'Manrope-ExtraBold': Manrope_800ExtraBold,
  });

  const [interLoaded] = useInter({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    'Inter': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  React.useEffect(() => {
    if (manropeLoaded && interLoaded) {
      SplashScreenModule.hideAsync().catch(() => {});
    }
  }, [manropeLoaded, interLoaded]);

  // Show loading while fonts load
  if (!manropeLoaded || !interLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9ff' }}>
        <ActivityIndicator size="large" color="#022448" />
      </View>
    );
  }

  // AppProviders contains: ErrorBoundary, DI, SafeArea, Theme, Network init, Navigation
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders />
    </GestureHandlerRootView>
  );
}
