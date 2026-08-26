import { db } from '@/services/firebase';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';

import type {
  CreateTeacherInput,
  TeacherRecord,
  TeacherStatus,
} from '@/modules/teacher-management/types/teacherTypes';

const teachersCollection = (organizationId: string) =>
  collection(db, 'organizations', organizationId, 'teachers');

export const subscribeTeachers = ({
  organizationId,
  onChange,
  onError,
}: {
  organizationId: string;
  onChange: (teachers: TeacherRecord[]) => void;
  onError?: (error: Error) => void;
}) => {
  return onSnapshot(
    teachersCollection(organizationId),
    snapshot => {
      const teachers: TeacherRecord[] = snapshot.docs.map(item => {
        const data = item.data();

        return {
          id: item.id,
          organizationId,
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          subject: data.subject || '',
          status: data.status || 'active',
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(),
          updatedAt: data.updatedAt?.toDate
            ? data.updatedAt.toDate()
            : new Date(),
        };
      });

      onChange(teachers);
    },
    error => {
      onError?.(error);
    }
  );
};

export const createTeacher = async ({
  organizationId,
  name,
  phone = '',
  email = '',
  subject = '',
}: CreateTeacherInput): Promise<void> => {
  const now = new Date();

  await addDoc(teachersCollection(organizationId), {
    organizationId,
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    subject: subject.trim(),
    status: 'active',
    createdAt: now,
    updatedAt: now,
  });
};

export const updateTeacherStatus = async ({
  organizationId,
  teacherId,
  status,
}: {
  organizationId: string;
  teacherId: string;
  status: TeacherStatus;
}): Promise<void> => {
  await updateDoc(
    doc(
      db,
      'organizations',
      organizationId,
      'teachers',
      teacherId
    ),
    {
      status,
      updatedAt: new Date(),
    }
  );
};
