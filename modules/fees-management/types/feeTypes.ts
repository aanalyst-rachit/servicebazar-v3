export type FeeStatus = 'paid' | 'pending' | 'partial';

export type FeeRecord = {
  id: string;
  organizationId: string;
  studentUserId: string;
  courseId: string;
  amount: number;
  paidAmount: number;
  status: FeeStatus;
  note: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateFeeInput = {
  organizationId: string;
  studentUserId: string;
  courseId?: string;
  amount: number;
  paidAmount?: number;
  note?: string;
};
