// ============================================================
// QuickCheck — Dashboard Store (Zustand)
// ============================================================
// Centralized state for the Dashboard feature.
// Holds aggregated dashboard data fetched via reportService.
//
// Usage:
//   const { data, isLoading, fetchDashboard } = useDashboardStore();
// ============================================================

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { DashboardData } from '../../../core/types/domain';
import type { IReportService } from '../../../core/di/container';

export interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;

  fetchDashboard: (service: IReportService) => Promise<void>;
  reset: () => void;
}

const initialState = {
  data: null as DashboardData | null,
  isLoading: false,
  error: null as string | null,
  lastFetched: null as Date | null,
};

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      ...initialState,

      fetchDashboard: async (service: IReportService) => {
        set({ isLoading: true, error: null });
        try {
          const data = await service.getDashboardData() as DashboardData;
          set({ data, isLoading: false, lastFetched: new Date() });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      reset: () => set(initialState),
    }),
    { name: 'dashboard-store' },
  ),
);