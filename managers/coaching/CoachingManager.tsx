import React from 'react';
import CoachingDashboardScreen from '@/managers/coaching/screens/CoachingDashboardScreen';
import type { CoachingManagerContext } from '@/managers/coaching/types/coachingTypes';

type Props = {
  context: CoachingManagerContext;
};

export default function CoachingManager({
  context,
}: Props) {
  return (
    <CoachingDashboardScreen
      context={context}
      organizationName="My Coaching"
    />
  );
}
