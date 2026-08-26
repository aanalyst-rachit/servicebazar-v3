import { db } from '@/services/firebase';
import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

import type {
  ClassRecord,
  CreateClassInput,
} from '@/modules/class-management/types/classTypes';

const classesCollection = (organizationId: string) =>
  collection(
    db,
    'organizations',
    organizationId,
    'classes'
  );

const mapClass = (
  id: string,
  data: Record<string, any>
): ClassRecord => ({
  id,
  organizationId: data.organizationId || '',
  courseId: data.courseId || '',
  batchId: data.batchId || '',
  title: data.title || 'Untitled Class',
  teacherName: data.teacherName || '',
  scheduledAt: data.scheduledAt?.toDate
    ? data.scheduledAt.toDate()
    : new Date(),
  status: data.status || 'scheduled',
  createdAt: data.createdAt?.toDate
    ? data.createdAt.toDate()
    : new Date(),
  updatedAt: data.updatedAt?.toDate
    ? data.updatedAt.toDate()
    : new Date(),
});

export const createClass = async (
  input: CreateClassInput
): Promise<void> => {
  await addDoc(
    classesCollection(input.organizationId),
    {
      ...input,
      status: 'scheduled',
      scheduledAt: input.scheduledAt,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );
};

export const subscribeClasses = ({
  organizationId,
  onChange,
}: {
  organizationId: string;
  onChange: (classes: ClassRecord[]) => void;
}) =>
  onSnapshot(
    classesCollection(organizationId),
    snapshot => {
      onChange(
        snapshot.docs.map(doc =>
          mapClass(doc.id, doc.data())
        )
      );
    }
  );
