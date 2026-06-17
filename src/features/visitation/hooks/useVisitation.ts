import { useState, useCallback, useEffect } from 'react';
import { useDI } from '../../../core/di/container';
import { Member } from '../../../core/types/domain';
import { useSettings } from '../../settings/hooks/useSettings';

export interface VisitationResult {
  memberId: string;
  absences: number;
  member: Member;
}

export function useVisitation() {
  const { visitationService } = useDI();
  const { settings } = useSettings();
  
  const [visitationList, setVisitationList] = useState<VisitationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVisitationList = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await visitationService.getMembersNeedingVisitation(settings.consecutiveAbsence);
      setVisitationList(list);
    } catch (error) {
      console.error('Error fetching visitation list', error);
    } finally {
      setIsLoading(false);
    }
  }, [visitationService, settings.consecutiveAbsence]);

  useEffect(() => {
    fetchVisitationList();
  }, [fetchVisitationList]);

  return {
    visitationList,
    isLoading,
    refresh: fetchVisitationList,
  };
}
