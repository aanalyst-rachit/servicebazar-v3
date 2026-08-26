import type { ComponentType } from 'react';

export type ManagerRole =
  | 'owner'
  | 'admin'
  | 'teacher'
  | 'staff'
  | 'member';

export type ManagerDefinition = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  category: string;
  price: string;

  requiredModules: string[];
  optionalModules: string[];

  component?: ComponentType<any>;
};

export type ManagerContext = {
  organizationId: string;
  userId: string;
  role: ManagerRole;
  enabledModules: string[];
};
