import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useApp } from '@/context/AppContext';
import {
  deleteTeacherNotification,
  getTeacherNotifications,
  saveTeacherNotification,
  type TeacherNotification,
} from '../coachingTeacherService';

type NotificationScreenProps = {
  onBack?: () => void;
};

const MAX_WORDS = 40;

const countWords = (value: string): number => {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
};

export default function NotificationScreen({
  onBack,
}: NotificationScreenProps) {
  const { firebaseUid } = useApp();

  const [message, setMessage] = useState('');
  const [notifications, setNotifications] = useState<
    TeacherNotification[]
  >([]);
  const [saving, setSaving] = useState(false);
  const [loadingNotifications, setLoadingNotifications] =
    useState(false);

  const wordCount = countWords(message);

  useEffect(() => {
    if (!firebaseUid) {
      return;
    }

    loadNotifications();
  }, [firebaseUid]);

  const loadNotifications = async () => {
    if (!firebaseUid) {
      return;
    }

    try {
      setLoadingNotifications(true);

      const loadedNotifications =
        await getTeacherNotifications(firebaseUid);

      setNotifications(loadedNotifications);
    } catch (error) {
      console.error(
        'TEACHER NOTIFICATIONS LOAD ERROR:',
        error
      );

      Alert.alert(
        'Error',
        'Unable to load notifications.'
      );
    } finally {
      setLoadingNotifications(false);
    }
  };

  const sendNotification = async () => {
    if (!firebaseUid) {
      Alert.alert(
        'Login required',
        'Teacher authentication not found.'
      );
      return;
    }

    const cleanMessage = message.trim();

    if (!cleanMessage) {
      Alert.alert(
        'Message required',
        'Please enter a notification message.'
      );
      return;
    }

    if (countWords(cleanMessage) > MAX_WORDS) {
      Alert.alert(
        'Message too long',
        'Notification cannot exceed 40 words.'
      );
      return;
    }

    try {
      setSaving(true);

      await saveTeacherNotification(
        firebaseUid,
        cleanMessage
      );

      setMessage('');

      await loadNotifications();

      Alert.alert(
        'Notification saved',
        'Your notification has been saved successfully.'
      );
    } catch (error: any) {
      console.error(
        'TEACHER NOTIFICATION SAVE ERROR:',
        error
      );

      Alert.alert(
        'Unable to send',
        error?.message ||
          'Unable to save notification.'
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (
    notification: TeacherNotification
  ) => {
    Alert.alert(
      'Delete notification',
      'Are you sure you want to delete this notification?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!firebaseUid) {
              return;
            }

            try {
              await deleteTeacherNotification(
                firebaseUid,
                notification.id
              );

              await loadNotifications();
            } catch (error) {
              console.error(
                'TEACHER NOTIFICATION DELETE ERROR:',
                error
              );

              Alert.alert(
                'Error',
                'Unable to delete notification.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onBack}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#0f172a"
          />
        </TouchableOpacity>

        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>
            Notifications
          </Text>

          <Text style={styles.headerSubtitle}>
            Send updates to your students
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.composeCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrap}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#2563eb"
              />

              <Text style={styles.sectionTitle}>
                New Notification
              </Text>
            </View>

            <Text
              style={[
                styles.wordCount,
                wordCount > MAX_WORDS &&
                  styles.wordCountError,
              ]}
            >
              {wordCount}/{MAX_WORDS}
            </Text>
          </View>

          <Text style={styles.label}>
            Notification Message
          </Text>

          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
            textAlignVertical="top"
            placeholder="Example: Today class is cancelled. New schedule will be shared soon."
            placeholderTextColor="#94a3b8"
            style={styles.messageInput}
          />

          <Text style={styles.helperText}>
            Maximum 40 words.
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={sendNotification}
            disabled={
              saving ||
              !message.trim() ||
              wordCount > MAX_WORDS
            }
            style={[
              styles.sendButton,
              (saving ||
                !message.trim() ||
                wordCount > MAX_WORDS) &&
                styles.buttonDisabled,
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Ionicons
                  name="send-outline"
                  size={20}
                  color="#ffffff"
                />

                <Text style={styles.sendButtonText}>
                  Send Notification
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.historyHeader}>
          <View style={styles.sectionTitleWrap}>
            <Ionicons
              name="time-outline"
              size={22}
              color="#2563eb"
            />

            <Text style={styles.sectionTitle}>
              Recent Notifications
            </Text>
          </View>
        </View>

        {loadingNotifications ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator />

            <Text style={styles.loadingText}>
              Loading notifications...
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color="#94a3b8"
            />

            <Text style={styles.emptyTitle}>
              No notifications yet
            </Text>

            <Text style={styles.emptyText}>
              Your sent notifications will appear here.
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <View
              key={notification.id}
              style={styles.notificationCard}
            >
              <View style={styles.notificationIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={21}
                  color="#2563eb"
                />
              </View>

              <View style={styles.notificationBody}>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>

                <Text style={styles.notificationDate}>
                  Notification
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  confirmDelete(notification)
                }
                style={styles.deleteButton}
              >
                <Ionicons
                  name="trash-outline"
                  size={19}
                  color="#dc2626"
                />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },

  headerTextWrap: {
    flex: 1,
    marginLeft: 12,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#0f172a',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: '#64748b',
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  composeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionTitle: {
    marginLeft: 8,
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },

  wordCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },

  wordCountError: {
    color: '#dc2626',
  },

  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },

  messageInput: {
    minHeight: 130,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },

  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748b',
  },

  sendButton: {
    marginTop: 16,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonText: {
    marginLeft: 8,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  historyHeader: {
    marginTop: 24,
    marginBottom: 12,
  },

  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  loadingText: {
    marginTop: 10,
    color: '#64748b',
    fontSize: 14,
  },

  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '700',
    color: '#334155',
  },

  emptyText: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: '#64748b',
  },

  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
  },

  notificationBody: {
    flex: 1,
    marginHorizontal: 12,
  },

  notificationMessage: {
    fontSize: 14,
    lineHeight: 21,
    color: '#1e293b',
  },

  notificationDate: {
    marginTop: 7,
    fontSize: 11,
    color: '#94a3b8',
  },

  deleteButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
  },
});
