import type { ManagerRole } from '@/factory/types/managerTypes';

export type OrganizationMemberType =
  | 'student'
  | 'member'
  | 'staff'
  | 'teacher'
  | 'customer';

export type OrganizationMemberStatus =
  | 'active'
  | 'inactive';

export type OrganizationMemberRecord = {
  organizationId: string;
  userId: string;
  memberType: OrganizationMemberType;
  status: OrganizationMemberStatus;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type OrganizationMemberProfile = {
  userId: string;
  name?: string;
  phone?: string;
  email?: string;
  profileUri?: string | null;
};

export type OrganizationMemberWithProfile =
  OrganizationMemberRecord & {
    profile?: OrganizationMemberProfile | null;
  };

export type MemberManagementContext = {
  organizationId: string;
  userId: string;
  role: ManagerRole;
};
