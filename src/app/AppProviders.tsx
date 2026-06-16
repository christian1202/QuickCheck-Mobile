// ============================================================
// QuickCheck — App Providers
// ============================================================
// Wraps the entire app with all required context providers:
//   - ErrorBoundary (catches unhandled render errors)
//   - DIProvider (dependency injection container)
//   - ThemeProvider (light/dark mode)
//   - NavigationContainer
//
// This is the canonical app root. Update dependencies here.
//
// Usage:
//   // In index.js / App.tsx:
//   import { AppProviders } from './app/AppProviders';
//   export default function App() {
//     return <AppProviders />;
//   }
// ============================================================

// eslint-disable-next-line no-var
declare var __DEV__: boolean;

import React, { useEffect, useState, useMemo } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, useTheme } from '../shared/theme/ThemeContext';
import { ErrorBoundary } from '../core/errors/ErrorBoundary';
import { DIProvider } from '../core/di/container';
import { logger } from '../core/logging/logger';
import { networkMonitor } from '../core/monitoring/networkMonitor';
import { syncEngine } from '../core/api/syncEngine';
import { createProductionContainer } from './container';
import { RootNavigator } from './navigation/RootNavigator';
import type { Dependencies } from '../core/di/container';

// ─── Inner App (wrapped by providers) ──────────────────────

const AppContent: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
};

// ─── AppInitializer (handles startup logic) ────────────────

const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function initialize() {
      try {
        logger.info('App', 'App initialization started');

        // 1. Initialize network monitor
        // NetInfo will be imported here to avoid issues if not installed
        try {
          const NetInfo = require('@react-native-community/netinfo').default;
          if (NetInfo) {
            networkMonitor.initialize(NetInfo);
          }
        } catch (e) {
          logger.warn('App', '@react-native-community/netinfo not available — using default online state');
        }

        // 2. Sync engine will be initialized by services when ready
        // (It needs the actual sync function from the data layer)

        logger.info('App', 'App initialization completed');
      } catch (error) {
        logger.error('App', 'App initialization failed', error instanceof Error ? error : undefined);
      } finally {
        setIsReady(true);
      }
    }

    initialize();

    return () => {
      // Cleanup
      networkMonitor.destroy();
    };
  }, []);

  if (!isReady) {
    // Could show a splash screen here
    return null;
  }

  return <>{children}</>;
};

// ─── AppProviders (Public API) ─────────────────────────────

export const AppProviders: React.FC = () => {
  // Build the production DI container (memoized to prevent rebuilds)
  const container: Dependencies = useMemo(() => createProductionContainer(), []);

  // Log startup
  useEffect(() => {
    logger.info('App', 'AppProviders mounted', { version: container.appVersion });
  }, [container]);

  return (
    <ErrorBoundary>
      <DIProvider value={container}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AppInitializer>
              <AppContent />
            </AppInitializer>
          </ThemeProvider>
        </SafeAreaProvider>
      </DIProvider>
    </ErrorBoundary>
  );
};