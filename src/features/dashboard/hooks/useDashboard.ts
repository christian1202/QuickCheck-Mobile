// ============================================================
// QuickCheck — useDashboard Hook
// ============================================================
import { useCallback, useEffect } from 'react';
import { useDI } from '../../../core/di/container';
import { useDashboardStore } from '../store/dashboardStore';

export function useDashboard() {
  const { reportService, logger } = useDI();
  const store = useDashboardStore();

  useEffect(() => {
    logger.debug('useDashboard', 'Auto-fetching dashboard data');
    store.fetchDashboard(reportService);
  }, []);

  const refresh = useCallback(() => {
    logger.info('useDashboard', 'Manual refresh');
    return store.fetchDashboard(reportService);
  }, [reportService]);

  return {
    data: store.data,
    isLoading: store.isLoading,
    error: store.error,
    lastFetched: store.lastFetched,
    refresh,
  };
}