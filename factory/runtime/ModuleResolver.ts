import type { ManagerDefinition } from '@/factory/types/managerTypes';

export const resolveManagerModules = (
  manager: ManagerDefinition,
  enabledModules: string[]
): string[] => {
  const enabled = new Set(enabledModules);

  return [
    ...manager.requiredModules,
    ...manager.optionalModules.filter(moduleId =>
      enabled.has(moduleId)
    ),
  ];
};
