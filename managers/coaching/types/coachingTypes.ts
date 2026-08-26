import type {
  ManagerContext,
  ManagerRole,
} from '@/factory/types/managerTypes';

export type CoachingDashboardMode =
  | 'provider'
  | 'teacher'
  | 'student';

export type CoachingManagerContext = ManagerContext & {
  managerId: 'coaching-manager';
};

export type CoachingRole = ManagerRole;

export type CoachingModuleCard = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
};
