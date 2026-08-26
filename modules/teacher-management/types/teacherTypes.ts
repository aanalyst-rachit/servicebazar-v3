export type TeacherStatus = 'active' | 'inactive';

export type TeacherRecord = {
  id: string;
  organizationId: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  status: TeacherStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTeacherInput = {
  organizationId: string;
  name: string;
  phone?: string;
  email?: string;
  subject?: string;
};
