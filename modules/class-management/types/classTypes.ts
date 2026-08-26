export type ClassStatus = 'scheduled' | 'completed' | 'cancelled';

export type ClassRecord = {
  id: string;
  organizationId: string;
  courseId: string;
  batchId: string;
  title: string;
  teacherName: string;
  scheduledAt: Date;
  status: ClassStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateClassInput = {
  organizationId: string;
  courseId: string;
  batchId: string;
  title: string;
  teacherName: string;
  scheduledAt: Date;
};
