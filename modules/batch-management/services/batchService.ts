import { db } from '@/services/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import type {
  BatchRecord,
  BatchStatus,
} from '@/modules/batch-management/types/batchTypes';

const batchesCollection = (organizationId: string) =>
  collection(db, 'organizations', organizationId, 'batches');

const toDate = (value: any): Date => {
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
};

const toBatchRecord = (
  organizationId: string,
  id: string,
  data: Record<string, any>
): BatchRecord => ({
  id,
  organizationId,
  name: data.name || '',
  courseId: data.courseId || '',
  startDate: toDate(data.startDate),
  endDate: data.endDate ? toDate(data.endDate) : null,
  status: data.status || 'active',
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
});

export const subscribeBatches = ({
  organizationId,
  onChange,
  onError,
}: {
  organizationId: string;
  onChange: (batches: BatchRecord[]) => void;
  onError?: (error: Error) => void;
}) => {
  const batchesQuery = query(
    batchesCollection(organizationId),
    orderBy('startDate', 'desc')
  );

  return onSnapshot(
    batchesQuery,
    snapshot => {
      onChange(
        snapshot.docs.map(batchDoc =>
          toBatchRecord(
            organizationId,
            batchDoc.id,
            batchDoc.data()
          )
        )
      );
    },
    error => onError?.(error)
  );
};

export const createBatch = async ({
  organizationId,
  name,
  courseId,
  startDate,
  endDate = null,
}: {
  organizationId: string;
  name: string;
  courseId: string;
  startDate: Date;
  endDate?: Date | null;
}) => {
  await addDoc(batchesCollection(organizationId), {
    organizationId,
    name: name.trim(),
    courseId,
    startDate,
    endDate,
    status: 'active' satisfies BatchStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateBatchStatus = async ({
  organizationId,
  batchId,
  status,
}: {
  organizationId: string;
  batchId: string;
  status: BatchStatus;
}) => {
  await updateDoc(
    doc(db, 'organizations', organizationId, 'batches', batchId),
    {
      status,
      updatedAt: serverTimestamp(),
    }
  );
};

export const deleteBatch = async ({
  organizationId,
  batchId,
}: {
  organizationId: string;
  batchId: string;
}) => {
  await deleteDoc(
    doc(db, 'organizations', organizationId, 'batches', batchId)
  );
};
