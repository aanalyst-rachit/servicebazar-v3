import React from 'react';
import { MemberManagementScreen } from '@/modules/member-management';
import type { CoachingManagerContext } from '@/managers/coaching/types/coachingTypes';

type Props = {
  context: CoachingManagerContext;
};

export default function CoachingStudentManagementScreen({
  context,
}: Props) {
  return (
    <MemberManagementScreen
      context={context}
      memberType="student"
      title="Students"
      singularLabel="Student"
      pluralLabel="Students"
    />
  );
}
