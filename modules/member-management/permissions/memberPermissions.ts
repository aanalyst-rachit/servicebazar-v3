import type { ManagerRole } from '@/factory/types/managerTypes';

const MANAGER_ROLES: ManagerRole[] = [
  'owner',
  'admin',
];

export const canManageOrganizationMembers = (
  role: ManagerRole
): boolean =>
  MANAGER_ROLES.includes(role);

export const canViewOrganizationMembers = (
  role: ManagerRole
): boolean =>
  [
    'owner',
    'admin',
    'teacher',
    'staff',
  ].includes(role);
