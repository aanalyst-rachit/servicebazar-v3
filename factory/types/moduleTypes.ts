import type { ComponentType } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type FactoryModule = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  category: string;
  price: string;
  component?: ComponentType<any>;
};
