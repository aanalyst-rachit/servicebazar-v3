import { db } from '@/services/firebase';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';

import type {
  CreateFeeInput,
  FeeRecord,
  FeeStatus,
} from '@/modules/fees-management/types/feeTypes';

const feesCollection = (organizationId: string) =>
  collection(
    db,
    'organizations',
    organizationId,
    'fees'
  );

const getStatus = (
  amount: number,
  paidAmount: number
): FeeStatus => {
  if (paidAmount >= amount) return 'paid';
  if (paidAmount > 0) return 'partial';
  return 'pending';
};

export const subscribeFees = ({
  organizationId,
  onChange,
  onError,
}: {
  organizationId: string;
  onChange: (fees: FeeRecord[]) => void;
  onError?: (error: Error) => void;
}) => {
  const feesQuery = query(
    feesCollection(organizationId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    feesQuery,
    snapshot => {
      const fees: FeeRecord[] = snapshot.docs.map(item => {
        const data = item.data();

        return {
          id: item.id,
          organizationId,
          studentUserId: String(data.studentUserId || ''),
          courseId: String(data.courseId || ''),
          amount: Number(data.amount || 0),
          paidAmount: Number(data.paidAmount || 0),
          status: (data.status || 'pending') as FeeStatus,
          note: String(data.note || ''),
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(),
          updatedAt: data.updatedAt?.toDate
            ? data.updatedAt.toDate()
            : new Date(),
        };
      });

      onChange(fees);
    },
    error => {
      onError?.(error);
    }
  );
};

export const createFee = async ({
  organizationId,
  studentUserId,
  courseId = '',
  amount,
  paidAmount = 0,
  note = '',
}: CreateFeeInput): Promise<void> => {
  const now = new Date();
  const safeAmount = Number(amount) || 0;
  const safePaidAmount = Math.min(
    Math.max(Number(paidAmount) || 0, 0),
    safeAmount
  );

  await addDoc(feesCollection(organizationId), {
    organizationId,
    studentUserId: studentUserId.trim(),
    courseId: courseId.trim(),
    amount: safeAmount,
    paidAmount: safePaidAmount,
    status: getStatus(safeAmount, safePaidAmount),
    note: note.trim(),
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
};
