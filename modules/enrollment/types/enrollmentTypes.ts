export type EnrollmentStatus = 'active' | 'inactive' | 'completed';

export type EnrollmentRecord = {
  id: string;
  organizationId: string;
  userId: string;
  studentUserId: string;
  memberType: string;
  courseId?: string;
  batchId?: string;
  status: EnrollmentStatus;
  enrollmentStatus: EnrollmentStatus;
  enrolledAt: Date;
  updatedAt: Date;
};

export type CreateEnrollmentInput = {
  organizationId: string;
  userId?: string;
  studentUserId?: string;
  memberType: string;
  courseId?: string;
  batchId?: string;
};
