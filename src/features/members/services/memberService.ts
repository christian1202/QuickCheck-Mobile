// ============================================================
// QuickCheck — Member Service
// ============================================================
// Handles all member CRUD operations against WatermelonDB.
// This is the ONLY place where member database queries live.
//
// Usage:
//   const memberService = createMemberService();
//   const members = await memberService.getMembers({ status: 'active' });
// ============================================================

import type { IMemberService } from '../../../core/di/container';
import type { Member, MemberFilters } from '../../../core/types/domain';
import { membersCollection } from '../../../core/database';
import { logger } from '../../../core/logging/logger';
import { Q } from '@nozbe/watermelondb';

export function createMemberService(): IMemberService {
  return {
    async getMembers(filters?: MemberFilters): Promise<Member[]> {
      logger.debug('MemberService', 'Fetching members', { filters });
      const conditions: Q.Clause[] = [];

      if (filters?.status) {
        conditions.push(Q.where('status', filters.status));
      }
      if (filters?.ministryGroupId) {
        conditions.push(Q.where('ministry_group_id', filters.ministryGroupId));
      }

      const records = await membersCollection.query(...conditions).fetch();
      logger.info('MemberService', 'Members fetched', { count: records.length });
      return records as unknown as Member[];
    },

    async getMemberById(id: string): Promise<Member | null> {
      logger.debug('MemberService', 'Fetching member by id', { id });
      try {
        const record = await membersCollection.find(id);
        return record as unknown as Member;
      } catch {
        logger.warn('MemberService', 'Member not found', { id });
        return null;
      }
    },

    async createMember(data: Member): Promise<Member> {
      logger.info('MemberService', 'Creating member', { name: `${data.first_name} ${data.last_name}` });
      await membersCollection.database.write(async () => {
        await membersCollection.create((record: any) => {
          record.local_id = data.local_id;
          record.first_name = data.first_name;
          record.last_name = data.last_name;
          record.photo_url = data.photo_url ?? null;
          record.contact_number = data.contact_number ?? null;
          record.address = data.address ?? null;
          record.google_maps_link = data.google_maps_link ?? null;
          record.role_in_church = data.role_in_church ?? null;
          record.ministry_group_id = data.ministry_group_id ?? null;
          record.member_since = data.member_since ?? null;
          record.birthday = data.birthday ?? null;
          record.emergency_contact = data.emergency_contact ?? null;
          record.status = data.status;
          record.user_id = data.user_id ?? null;
          record.created_at = Date.now();
          record.updated_at = Date.now();
        });
      });
      // Re-fetch to get the generated ID
      const all = await membersCollection.query().fetch();
      const created = all[all.length - 1] as unknown as Member;
      return created;
    },

    async updateMember(id: string, data: Partial<Member>): Promise<Member> {
      logger.info('MemberService', 'Updating member', { id });
      const record = await membersCollection.find(id);
      await membersCollection.database.write(async () => {
        await record.update((r: any) => {
          if (data.first_name !== undefined) r.first_name = data.first_name;
          if (data.last_name !== undefined) r.last_name = data.last_name;
          if (data.photo_url !== undefined) r.photo_url = data.photo_url;
          if (data.contact_number !== undefined) r.contact_number = data.contact_number;
          if (data.address !== undefined) r.address = data.address;
          if (data.google_maps_link !== undefined) r.google_maps_link = data.google_maps_link;
          if (data.role_in_church !== undefined) r.role_in_church = data.role_in_church;
          if (data.ministry_group_id !== undefined) r.ministry_group_id = data.ministry_group_id;
          if (data.member_since !== undefined) r.member_since = data.member_since;
          if (data.birthday !== undefined) r.birthday = data.birthday;
          if (data.emergency_contact !== undefined) r.emergency_contact = data.emergency_contact;
          if (data.status !== undefined) r.status = data.status;
          r.updated_at = Date.now();
        });
      });
      return record as unknown as Member;
    },

    async deleteMember(id: string): Promise<void> {
      logger.info('MemberService', 'Deleting member', { id });
      const record = await membersCollection.find(id);
      await membersCollection.database.write(async () => {
        await record.destroyPermanently();
      });
    },

    async searchMembers(query: string): Promise<Member[]> {
      logger.debug('MemberService', 'Searching members', { query });
      const all = await membersCollection.query().fetch();
      const lowerQuery = query.toLowerCase();
      const filtered = all.filter((m: any) => {
        const full = `${m.first_name} ${m.last_name}`.toLowerCase();
        return full.includes(lowerQuery);
      });
      logger.info('MemberService', 'Search complete', { query, results: filtered.length });
      return filtered as unknown as Member[];
    },
  };
}