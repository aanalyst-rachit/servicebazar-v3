import type { ComponentType } from 'react';

import QuoteStudioScreen from '@/screens/QuoteStudioScreen';

type FactoryLaunchProps = {
  profileUri?: string | null;
  ownerName?: string;
  shopName?: string;
  category?: string;
  subcategory?: string;
  phone?: string;
};

export function getFactoryModuleComponent(
  moduleId: string,
): ComponentType<any> | null {
  switch (moduleId) {
    case 'quote-maker':
      return QuoteStudioScreen;

    default:
      return null;
  }
}

export function getFactoryModuleProps(
  moduleId: string,
  props: FactoryLaunchProps,
): FactoryLaunchProps {
  switch (moduleId) {
    case 'quote-maker':
      return props;

    default:
      return {};
  }
}
