import React from 'react';
import { BatchManagementScreen as BatchScreen } from '@/modules/batch-management';
import type { CoachingManagerContext } from '@/managers/coaching/types/coachingTypes';

type Props = {
  context: CoachingManagerContext;
};

export default function CoachingBatchManagementScreen({ context }: Props) {
  return <BatchScreen context={context} />;
}
