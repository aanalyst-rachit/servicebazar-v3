import { db } from '@/services/firebase';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';

import type {
  CreateEnrollmentInput,
  EnrollmentRecord,
} from '@/modules/enrollment/types/enrollmentTypes';

const enrollmentsCollection = (organizationId: string) =>
  collection(
    db,
    'organizations',
    organizationId,
    'enrollments'
  );

const mapEnrollment = (
  id: string,
  data: Record<string, any>
): EnrollmentRecord => {
  const status =
    data.status ||
    data.enrollmentStatus ||
    'active';

  return {
    id,
    organizationId: data.organizationId || '',
    userId:
      data.userId ||
      data.studentUserId ||
      '',
    studentUserId:
      data.studentUserId ||
      data.userId ||
      '',
    memberType: data.memberType || 'member',
    courseId: data.courseId || '',
    batchId: data.batchId || '',
    status,
    enrollmentStatus: status,
    enrolledAt: data.enrolledAt?.toDate
      ? data.enrolledAt.toDate()
      : new Date(),
    updatedAt: data.updatedAt?.toDate
      ? data.updatedAt.toDate()
      : new Date(),
  };
};

export const createEnrollment = async ({
  organizationId,
  userId,
  studentUserId,
  memberType,
  courseId,
  batchId,
}: CreateEnrollmentInput): Promise<void> => {
  const resolvedStudentUserId =
    studentUserId || userId;

  if (!resolvedStudentUserId) {
    throw new Error(
      'Student user ID is required.'
    );
  }

  const enrollmentRef = doc(
    enrollmentsCollection(organizationId),
    resolvedStudentUserId
  );

  const now = new Date();

  await setDoc(
    enrollmentRef,
    {
      organizationId,
      userId: resolvedStudentUserId,
      studentUserId: resolvedStudentUserId,
      memberType,
      courseId: courseId || '',
      batchId: batchId || '',
      status: 'active',
      enrollmentStatus: 'active',
      enrolledAt: now,
      updatedAt: now,
    },
    { merge: true }
  );
};

export const getEnrollment = async ({
  organizationId,
  userId,
}: {
  organizationId: string;
  userId: string;
}): Promise<EnrollmentRecord | null> => {
  const enrollmentSnap = await getDoc(
    doc(
      db,
      'organizations',
      organizationId,
      'enrollments',
      userId
    )
  );

  if (!enrollmentSnap.exists()) {
    return null;
  }

  return mapEnrollment(
    enrollmentSnap.id,
    enrollmentSnap.data()
  );
};

export const subscribeEnrollments = ({
  organizationId,
  onChange,
}: {
  organizationId: string;
  onChange: (
    enrollments: EnrollmentRecord[]
  ) => void;
}) => {
  return onSnapshot(
    enrollmentsCollection(organizationId),
    snapshot => {
      const enrollments = snapshot.docs.map(
        item =>
          mapEnrollment(
            item.id,
            item.data()
          )
      );

      onChange(enrollments);
    },
    error => {
      console.error(
        'Enrollment subscription error:',
        error
      );
    }
  );
};
