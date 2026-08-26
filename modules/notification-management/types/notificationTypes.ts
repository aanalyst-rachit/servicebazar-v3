export type NotificationType =
  | 'general'
  | 'fee'
  | 'attendance'
  | 'class'
  | 'announcement';

export type NotificationRecord = {
  id: string;
  organizationId: string;
  title: string;
  message: string;
  type: NotificationType;
  targetUserId: string;
  createdAt: Date;
  read: boolean;
};

export type CreateNotificationInput = {
  organizationId: string;
  title: string;
  message: string;
  type?: NotificationType;
  targetUserId?: string;
};
