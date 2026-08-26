import type { ManagerDefinition } from '@/factory/types/managerTypes';
import { FACTORY_MANAGERS } from '@/factory/registry/managers';

export const resolveManager = (
  managerId: string
): ManagerDefinition | undefined =>
  FACTORY_MANAGERS.find(manager => manager.id === managerId);

export const getAvailableManagers = (): ManagerDefinition[] =>
  FACTORY_MANAGERS;

export function getManagerComponent(
  managerId: string,
): import('react').ComponentType<any> | null {
  switch (managerId) {
    case 'coaching-manager':
      return require('@/managers/coaching/CoachingManager')
        .default;

    default:
      return null;
  }
}
