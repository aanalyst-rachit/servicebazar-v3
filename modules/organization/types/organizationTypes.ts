import type { ManagerRole } from '@/factory/types/managerTypes';

export type OrganizationType = 'provider-business' | 'coaching';

export type OrganizationStatus = 'active' | 'inactive';

export type OrganizationRecord = {
  id: string;
  ownerId: string;
  type: OrganizationType;
  name: string;
  legacyProviderUid: string;
  legacyShopPhone: string;
  status: OrganizationStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type OrganizationMembershipStatus = 'active' | 'inactive';

export type OrganizationMembership = {
  organizationId: string;
  userId: string;
  role: ManagerRole;
  status: OrganizationMembershipStatus;
  joinedAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};
