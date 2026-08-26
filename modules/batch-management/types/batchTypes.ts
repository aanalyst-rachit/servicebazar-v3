export type BatchStatus = 'active' | 'inactive';

export type BatchRecord = {
  id: string;
  organizationId: string;
  name: string;
  courseId: string;
  startDate: Date;
  endDate?: Date | null;
  status: BatchStatus;
  createdAt: Date;
  updatedAt: Date;
};
