import type { ManagerDefinition } from '@/factory/types/managerTypes';
import { FACTORY_MANAGERS } from '@/factory/registry/managers';

export const getManagerConfig = (
  managerId: string
): ManagerDefinition | undefined =>
  FACTORY_MANAGERS.find(manager => manager.id === managerId);

export const getRequiredModules = (
  managerId: string
): string[] => {
  const manager = getManagerConfig(managerId);
  return manager?.requiredModules ?? [];
};

export const getOptionalModules = (
  managerId: string
): string[] => {
  const manager = getManagerConfig(managerId);
  return manager?.optionalModules ?? [];
};
