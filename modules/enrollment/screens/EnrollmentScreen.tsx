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

import {
  createEnrollment,
  subscribeEnrollments,
} from '@/modules/enrollment/services/enrollmentService';

import type { EnrollmentRecord } from '@/modules/enrollment/types/enrollmentTypes';

type Props = {
  context: {
    organizationId: string;
    userId: string;
  };
};

export default function EnrollmentScreen({ context }: Props) {
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [userId, setUserId] = useState('');
  const [memberType, setMemberType] = useState('student');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!context.organizationId) {
      setEnrollments([]);
      return;
    }

    return subscribeEnrollments({
      organizationId: context.organizationId,
      onChange: setEnrollments,
    });
  }, [context.organizationId]);

  const handleEnroll = async () => {
    const trimmedUserId = userId.trim();

    if (!trimmedUserId) {
      Alert.alert(
        'Student required',
        'Enter the ServiceBazar user ID.'
      );
      return;
    }

    setSaving(true);

    try {
      await createEnrollment({
        organizationId: context.organizationId,
        userId: trimmedUserId,
        memberType,
      });

      setUserId('');

      Alert.alert(
        'Success',
        'Student enrolled successfully.'
      );
    } catch (error) {
      console.error('Enrollment failed:', error);

      Alert.alert(
        'Enrollment failed',
        error instanceof Error
          ? error.message
          : 'Unable to create enrollment.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Enrollment</Text>
          <Text style={styles.subtitle}>
            Enroll existing ServiceBazar users.
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {enrollments.length}
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Student User ID</Text>

        <TextInput
          value={userId}
          onChangeText={setUserId}
          placeholder="Enter ServiceBazar user ID"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Member Type</Text>

        <View style={styles.typeRow}>
          {['student', 'member'].map(type => (
            <TouchableOpacity
              key={type}
              activeOpacity={0.85}
              onPress={() => setMemberType(type)}
              style={[
                styles.typeButton,
                memberType === type && styles.typeButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.typeText,
                  memberType === type && styles.typeTextActive,
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleEnroll}
          disabled={saving}
          style={[
            styles.button,
            saving && styles.buttonDisabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>
              Enroll Student
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>
        Current Enrollments
      </Text>

      {enrollments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            No enrollments yet
          </Text>
          <Text style={styles.emptyText}>
            Enrolled students will appear here automatically.
          </Text>
        </View>
      ) : (
        enrollments.map(enrollment => (
          <View key={enrollment.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.studentId}>
                {enrollment.userId}
              </Text>

              <Text style={styles.status}>
                {enrollment.enrollmentStatus}
              </Text>
            </View>

            <Text style={styles.meta}>
              Type: {enrollment.memberType}
            </Text>

            <Text style={styles.meta}>
              Enrolled:{' '}
              {enrollment.enrolledAt.toLocaleDateString()}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },

  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748b',
  },

  countBadge: {
    minWidth: 38,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },

  countText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#4f46e5',
  },

  form: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },

  label: {
    marginTop: 4,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },

  input: {
    height: 46,
    paddingHorizontal: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    color: '#111827',
  },

  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },

  typeButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
  },

  typeButtonActive: {
    backgroundColor: '#eef2ff',
  },

  typeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
  },

  typeTextActive: {
    color: '#4f46e5',
  },

  button: {
    height: 46,
    marginTop: 16,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },

  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },

  empty: {
    padding: 20,
    borderRadius: 18,
    backgroundColor: '#ffffff',
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },

  emptyText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
  },

  card: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 17,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  studentId: {
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },

  status: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
    backgroundColor: '#dcfce7',
  },

  meta: {
    marginTop: 5,
    fontSize: 11,
    color: '#64748b',
  },
});
