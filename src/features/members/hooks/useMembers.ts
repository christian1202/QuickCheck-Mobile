// ============================================================
// QuickCheck — useMembers Hook
// ============================================================
// Wires the Member Zustand store to the DI container.
// Screens use this hook — they never import the store directly.
//
// Usage:
//   const { members, isLoading, fetchMembers, createMember } = useMembers();
// ============================================================

import { useCallback, useEffect } from 'react';
import { useDI } from '../../../core/di/container';
import { useMemberStore } from '../store/memberStore';
import type { Member, MemberFilters } from '../../../core/types/domain';

export function useMembers() {
  const { memberService, logger } = useDI();

  const store = useMemberStore();

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    logger.debug('useMembers', 'Auto-fetching members');
    store.fetchMembers(memberService);
  }, [store.filters]);

  const fetchMembers = useCallback(() => {
    logger.debug('useMembers', 'Manual fetch triggered');
    return store.fetchMembers(memberService);
  }, [memberService]);

  const fetchMemberById = useCallback((id: string) => {
    return store.fetchMemberById(memberService, id);
  }, [memberService]);

  const createMember = useCallback(async (data: Member) => {
    logger.info('useMembers', 'Creating member', { name: `${data.first_name} ${data.last_name}` });
    const result = await store.createMember(memberService, data);
    return result;
  }, [memberService]);

  const updateMember = useCallback(async (id: string, data: Partial<Member>) => {
    logger.info('useMembers', 'Updating member', { id });
    const result = await store.updateMember(memberService, id, data);
    return result;
  }, [memberService]);

  const deleteMember = useCallback(async (id: string) => {
    logger.info('useMembers', 'Deleting member', { id });
    return store.deleteMember(memberService, id);
  }, [memberService]);

  const searchMembers = useCallback((query: string) => {
    logger.debug('useMembers', 'Searching members', { query });
    return store.searchMembers(memberService, query);
  }, [memberService]);

  const setFilters = useCallback((filters: Partial<MemberFilters>) => {
    store.setFilters(filters);
  }, []);

  const clearFilters = useCallback(() => {
    store.clearFilters();
  }, []);

  return {
    // Data
    members: store.members,
    selectedMember: store.selectedMember,
    filters: store.filters,

    // Loading & Error
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    fetchMembers,
    fetchMemberById,
    createMember,
    updateMember,
    deleteMember,
    searchMembers,
    setFilters,
    clearFilters,
    selectMember: store.selectMember,
    clearSelection: store.clearSelection,
  };
}