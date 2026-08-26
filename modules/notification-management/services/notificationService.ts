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
  CreateNotificationInput,
  NotificationRecord,
  NotificationType,
} from '@/modules/notification-management/types/notificationTypes';

const notificationsCollection = (organizationId: string) =>
  collection(
    db,
    'organizations',
    organizationId,
    'notifications'
  );

export const subscribeNotifications = ({
  organizationId,
  onChange,
  onError,
}: {
  organizationId: string;
  onChange: (records: NotificationRecord[]) => void;
  onError?: (error: Error) => void;
}) => {
  const notificationsQuery = query(
    notificationsCollection(organizationId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    notificationsQuery,
    snapshot => {
      const records: NotificationRecord[] = snapshot.docs.map(item => {
        const data = item.data();

        return {
          id: item.id,
          organizationId,
          title: String(data.title || ''),
          message: String(data.message || ''),
          type: (data.type || 'general') as NotificationType,
          targetUserId: String(data.targetUserId || ''),
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(),
          read: Boolean(data.read),
        };
      });

      onChange(records);
    },
    error => {
      onError?.(error);
    }
  );
};

export const createNotification = async ({
  organizationId,
  title,
  message,
  type = 'general',
  targetUserId = '',
}: CreateNotificationInput): Promise<void> => {
  const now = new Date();

  await addDoc(
    notificationsCollection(organizationId),
    {
      organizationId,
      title: title.trim(),
      message: message.trim(),
      type,
      targetUserId: targetUserId.trim(),
      createdAt: Timestamp.fromDate(now),
      read: false,
    }
  );
};
