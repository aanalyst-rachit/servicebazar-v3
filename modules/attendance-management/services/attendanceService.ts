import { db } from '@/services/firebase';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  setDoc,
} from 'firebase/firestore';

import type {
  AttendanceRecord,
  CreateAttendanceInput,
} from '@/modules/attendance-management/types/attendanceTypes';

const attendanceCollection = (organizationId: string) =>
  collection(
    db,
    'organizations',
    organizationId,
    'attendance'
  );

export const subscribeAttendance = ({
  organizationId,
  onChange,
  onError,
}: {
  organizationId: string;
  onChange: (records: AttendanceRecord[]) => void;
  onError?: (error: Error) => void;
}) => {
  const attendanceQuery = query(
    attendanceCollection(organizationId),
    orderBy('date', 'desc')
  );

  return onSnapshot(
    attendanceQuery,
    snapshot => {
      const records: AttendanceRecord[] = snapshot.docs.map(item => {
        const data = item.data();

        return {
          id: item.id,
          organizationId,
          studentUserId: data.studentUserId || '',
          studentName: data.studentName || '',
          batchId: data.batchId || '',
          date: data.date?.toDate
            ? data.date.toDate()
            : new Date(),
          status: data.status || 'present',
          markedAt: data.markedAt?.toDate
            ? data.markedAt.toDate()
            : new Date(),
        };
      });

      onChange(records);
    },
    error => {
      onError?.(error);
    }
  );
};

export const createAttendance = async ({
  organizationId,
  studentUserId,
  studentName,
  batchId,
  date,
  status,
}: CreateAttendanceInput): Promise<void> => {
  await addDoc(
    attendanceCollection(organizationId),
    {
      organizationId,
      studentUserId,
      studentName,
      batchId,
      date,
      status,
      markedAt: new Date(),
    }
  );
};


export const markAttendance = async ({
  organizationId,
  studentUserId,
  date,
  status,
}: {
  organizationId: string;
  studentUserId: string;
  date: Date;
  status: 'present' | 'absent';
}): Promise<void> => {
  const attendanceRef = doc(
    attendanceCollection(organizationId),
    `${studentUserId}_${date.toISOString().slice(0, 10)}`
  );

  const now = new Date();

  await setDoc(
    attendanceRef,
    {
      organizationId,
      studentUserId,
      date,
      status,
      markedAt: now,
    },
    { merge: true }
  );
};
