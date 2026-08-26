export type CourseStatus = 'active' | 'inactive';

export type CourseRecord = {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  duration: string;
  fee: number;
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateCourseInput = {
  organizationId: string;
  name: string;
  description?: string;
  duration?: string;
  fee?: number;
};
