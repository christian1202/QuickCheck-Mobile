// ============================================================
// QuickCheck — Auth Store (Zustand)
// ============================================================
// Tracks authentication state: current user, loading, errors.
//
// Usage:
//   const { user, isAuthenticated, login, logout } = useAuthStore();
// ============================================================

import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { IAuthService } from '../../../core/di/container';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  fullName?: string;
  photoUrl?: string;
  localId?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: (service: IAuthService) => Promise<void>;
  loginWithGoogle: (service: IAuthService) => Promise<void>;
  logout: (service: IAuthService) => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  reset: () => void;
}

const initialState = {
  user: null as AuthUser | null,
  isLoading: false,
  isInitialized: false,
  error: null as string | null,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        initialize: async (service: IAuthService) => {
          set({ isLoading: true });

          try {
            const session = await service.getCurrentUser();
            if (session) {
              set({
                user: {
                  id: session.id,
                  email: session.email,
                  role: session.role,
                },
                isInitialized: true,
                isLoading: false,
              });
            } else {
              set({ user: null, isInitialized: true, isLoading: false });
            }
          } catch (error) {
            set({
              error: (error as Error).message,
              isInitialized: true,
              isLoading: false,
            });
          }
        },

        loginWithGoogle: async (service: IAuthService) => {
          set({ isLoading: true, error: null });

          try {
            const session = await service.loginWithGoogle();
            set({
              user: {
                id: session.id,
                email: session.email,
                role: session.role,
                fullName: session.fullName,
              },
              isLoading: false,
            });
          } catch (error) {
            set({
              error: (error as Error).message,
              isLoading: false,
            });
            throw error;
          }
        },

        logout: async (service: IAuthService) => {
          set({ isLoading: true });

          try {
            await service.logout();
            set({ user: null, isLoading: false });
          } catch (error) {
            set({
              error: (error as Error).message,
              isLoading: false,
            });
            throw error;
          }
        },

        setUser: (user: AuthUser | null) => set({ user }),
        reset: () => set(initialState),
      }),
      {
        name: 'auth-store',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
          user: state.user,
          isInitialized: state.isInitialized,
        }),
      },
    ),
    { name: 'auth-store' },
  ),
);