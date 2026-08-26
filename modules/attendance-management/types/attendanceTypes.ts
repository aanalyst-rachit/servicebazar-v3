export type AttendanceStatus = 'present' | 'absent' | 'late';

export type AttendanceRecord = {
  id: string;
  organizationId: string;
  studentUserId: string;
  studentName: string;
  batchId: string;
  date: Date;
  status: AttendanceStatus;
  markedAt: Date;
};

export type CreateAttendanceInput = {
  organizationId: string;
  studentUserId: string;
  studentName: string;
  batchId: string;
  date: Date;
  status: AttendanceStatus;
};
