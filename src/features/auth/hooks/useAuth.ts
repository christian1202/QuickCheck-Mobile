// ============================================================
// QuickCheck — useAuth Hook
// ============================================================
import { useCallback, useEffect } from 'react';
import { useDI } from '../../../core/di/container';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { authService, logger } = useDI();
  const store = useAuthStore();

  useEffect(() => {
    if (!store.isInitialized) {
      logger.debug('useAuth', 'Initializing auth');
      store.initialize(authService);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    logger.info('useAuth', 'Logging in', { email });
    return store.login(authService, email, password);
  }, [authService]);

  const logout = useCallback(async () => {
    logger.info('useAuth', 'Logging out');
    return store.logout(authService);
  }, [authService]);

  return {
    user: store.user,
    isAuthenticated: !!store.user,
    isInitialized: store.isInitialized,
    isLoading: store.isLoading,
    error: store.error,
    login,
    logout,
  };
}