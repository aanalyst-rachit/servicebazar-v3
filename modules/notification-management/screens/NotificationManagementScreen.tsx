import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { ManagerContext } from '@/factory/types/managerTypes';
import {
  createNotification,
  subscribeNotifications,
} from '@/modules/notification-management/services/notificationService';
import type { NotificationRecord } from '@/modules/notification-management/types/notificationTypes';

type Props = {
  context: ManagerContext;
};

export default function NotificationManagementScreen({
  context,
}: Props) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!context.organizationId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    return subscribeNotifications({
      organizationId: context.organizationId,
      onChange: records => {
        setNotifications(records);
        setLoading(false);
      },
      onError: error => {
        setLoading(false);
        Alert.alert(
          'Notifications',
          error.message || 'Unable to load notifications.'
        );
      },
    });
  }, [context.organizationId]);

  const handleCreate = async () => {
    if (!context.organizationId) {
      Alert.alert('Notifications', 'Organization is not available.');
      return;
    }

    if (!title.trim() || !message.trim()) {
      Alert.alert(
        'Notifications',
        'Title and message are required.'
      );
      return;
    }

    setSaving(true);

    try {
      await createNotification({
        organizationId: context.organizationId,
        title,
        message,
      });

      setTitle('');
      setMessage('');

      Alert.alert(
        'Success',
        'Notification created successfully.'
      );
    } catch (error: any) {
      Alert.alert(
        'Notifications',
        error?.message || 'Unable to create notification.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons
            name="notifications-outline"
            size={23}
            color="#4f46e5"
          />
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>
            Send announcements to coaching members
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {notifications.length}
          </Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>
          Create Notification
        </Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Notification title"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Notification message"
          placeholderTextColor="#94a3b8"
          multiline
          style={[styles.input, styles.messageInput]}
        />

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={saving}
          onPress={handleCreate}
          style={[
            styles.button,
            saving && styles.disabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons
                name="send-outline"
                size={17}
                color="#ffffff"
              />
              <Text style={styles.buttonText}>
                Send Notification
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>
        Recent Notifications
      </Text>

      {loading ? (
        <View style={styles.emptyCard}>
          <ActivityIndicator color="#4f46e5" />
          <Text style={styles.muted}>
            Loading notifications...
          </Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons
            name="notifications-off-outline"
            size={36}
            color="#6366f1"
          />
          <Text style={styles.emptyTitle}>
            No notifications yet
          </Text>
          <Text style={styles.muted}>
            Create your first coaching announcement above.
          </Text>
        </View>
      ) : (
        notifications.slice(0, 10).map(item => (
          <View key={item.id} style={styles.notificationCard}>
            <View style={styles.notificationIcon}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#4f46e5"
              />
            </View>

            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>
                {item.title}
              </Text>

              <Text style={styles.notificationMessage}>
                {item.message}
              </Text>

              <Text style={styles.date}>
                {item.createdAt.toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 11,
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748b',
  },
  badge: {
    minWidth: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#4f46e5',
  },
  formCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 11,
  },
  input: {
    minHeight: 44,
    marginBottom: 9,
    paddingHorizontal: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    color: '#111827',
  },
  messageInput: {
    minHeight: 82,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  button: {
    minHeight: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#4f46e5',
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  emptyCard: {
    padding: 22,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  emptyTitle: {
    marginTop: 9,
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  muted: {
    marginTop: 5,
    fontSize: 11,
    textAlign: 'center',
    color: '#64748b',
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 13,
    marginBottom: 9,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  notificationIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },
  notificationInfo: {
    flex: 1,
    marginLeft: 11,
  },
  notificationTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },
  notificationMessage: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: '#64748b',
  },
  date: {
    marginTop: 6,
    fontSize: 10,
    color: '#94a3b8',
  },
});
