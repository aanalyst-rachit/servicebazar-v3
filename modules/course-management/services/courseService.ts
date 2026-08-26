import { db } from '@/services/firebase';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';

import type {
  CourseRecord,
  CreateCourseInput,
} from '@/modules/course-management/types/courseTypes';

const coursesCollection = (organizationId: string) =>
  collection(
    db,
    'organizations',
    organizationId,
    'courses'
  );

const toDate = (value: any): Date => {
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
};

const toCourseRecord = (
  organizationId: string,
  id: string,
  data: Record<string, any>
): CourseRecord => ({
  id,
  organizationId,
  name: data.name || '',
  description: data.description || '',
  duration: data.duration || '',
  fee: Number(data.fee || 0),
  status: data.status || 'active',
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
});

export const subscribeCourses = ({
  organizationId,
  onChange,
  onError,
}: {
  organizationId: string;
  onChange: (courses: CourseRecord[]) => void;
  onError?: (error: Error) => void;
}) => {
  const coursesQuery = query(
    coursesCollection(organizationId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    coursesQuery,
    snapshot => {
      onChange(
        snapshot.docs.map(course =>
          toCourseRecord(
            organizationId,
            course.id,
            course.data()
          )
        )
      );
    },
    error => onError?.(error)
  );
};

export const createCourse = async ({
  organizationId,
  name,
  description = '',
  duration = '',
  fee = 0,
}: CreateCourseInput): Promise<string> => {
  const now = new Date();

  const courseRef = await addDoc(
    coursesCollection(organizationId),
    {
      organizationId,
      name: name.trim(),
      description: description.trim(),
      duration: duration.trim(),
      fee: Number(fee),
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }
  );

  return courseRef.id;
};

export const getCourse = async ({
  organizationId,
  courseId,
}: {
  organizationId: string;
  courseId: string;
}): Promise<CourseRecord | null> => {
  const snapshot = await getDoc(
    doc(
      db,
      'organizations',
      organizationId,
      'courses',
      courseId
    )
  );

  if (!snapshot.exists()) return null;

  return toCourseRecord(
    organizationId,
    snapshot.id,
    snapshot.data()
  );
};

export const updateCourse = async ({
  organizationId,
  courseId,
  changes,
}: {
  organizationId: string;
  courseId: string;
  changes: Partial<
    Pick<
      CourseRecord,
      'name' | 'description' | 'duration' | 'fee' | 'status'
    >
  >;
}): Promise<void> => {
  await updateDoc(
    doc(
      db,
      'organizations',
      organizationId,
      'courses',
      courseId
    ),
    {
      ...changes,
      updatedAt: new Date(),
    }
  );
};
