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

  const loginWithGoogle = useCallback(async () => {
    logger.info('useAuth', 'Logging in with Google');
    return store.loginWithGoogle(authService);
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
    loginWithGoogle,
    logout,
  };
}