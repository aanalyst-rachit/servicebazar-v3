import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import {
  subscribeAttendance,
  markAttendance,
} from '@/modules/attendance-management/services/attendanceService';
import type { AttendanceRecord } from '@/modules/attendance-management/types/attendanceTypes';

type Props = {
  context: {
    organizationId?: string;
  };
};

export default function AttendanceManagementScreen({
  context,
}: Props) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!context.organizationId) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    return subscribeAttendance({
      organizationId: context.organizationId,
      onChange: nextRecords => {
        setRecords(nextRecords);
        setLoading(false);
      },
    });
  }, [context.organizationId]);

  const handleMarkPresent = async () => {
    if (!context.organizationId) {
      Alert.alert('Attendance', 'Organization not available.');
      return;
    }

    try {
      await markAttendance({
        organizationId: context.organizationId,
        studentUserId: `student-${Date.now()}`,
        date: new Date(),
        status: 'present',
      });

      Alert.alert('Attendance', 'Attendance marked successfully.');
    } catch (error: any) {
      Alert.alert(
        'Attendance',
        error?.message || 'Unable to mark attendance.'
      );
    }
  };

  const presentCount = records.filter(
    item => item.status === 'present'
  ).length;

  const absentCount = records.filter(
    item => item.status === 'absent'
  ).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons
            name="checkmark-done-outline"
            size={24}
            color="#4f46e5"
          />
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.title}>Attendance Management</Text>
          <Text style={styles.subtitle}>
            Track daily student attendance
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{records.length}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{presentCount}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{absentCount}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{records.length}</Text>
          <Text style={styles.statLabel}>Records</Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleMarkPresent}
        style={styles.primaryButton}
      >
        <Ionicons
          name="checkmark-circle-outline"
          size={19}
          color="#ffffff"
        />

        <Text style={styles.primaryButtonText}>
          Mark Attendance
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>
        Recent Attendance
      </Text>

      {loading ? (
        <View style={styles.emptyCard}>
          <ActivityIndicator color="#4f46e5" />
          <Text style={styles.emptyText}>
            Loading attendance...
          </Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons
            name="calendar-outline"
            size={38}
            color="#6366f1"
          />

          <Text style={styles.emptyTitle}>
            No attendance records
          </Text>

          <Text style={styles.emptyText}>
            Attendance records will appear here.
          </Text>
        </View>
      ) : (
        records.map(record => (
          <View key={record.id} style={styles.recordCard}>
            <View style={styles.recordIcon}>
              <Ionicons
                name={
                  record.status === 'present'
                    ? 'checkmark-circle'
                    : 'close-circle'
                }
                size={23}
                color={
                  record.status === 'present'
                    ? '#16a34a'
                    : '#dc2626'
                }
              />
            </View>

            <View style={styles.recordInfo}>
              <Text style={styles.studentId}>
                {record.studentUserId}
              </Text>

              <Text style={styles.date}>
                {record.date instanceof Date
                  ? record.date.toLocaleDateString()
                  : 'Date not available'}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                record.status === 'absent' &&
                  styles.absentBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  record.status === 'absent' &&
                    styles.absentText,
                ]}
              >
                {record.status}
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
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
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
    marginLeft: 12,
  },

  title: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
  },

  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748b',
  },

  countBadge: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },

  countText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#4f46e5',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 13,
  },

  statCard: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },

  statValue: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
  },

  statLabel: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },

  primaryButton: {
    minHeight: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    backgroundColor: '#4f46e5',
  },

  primaryButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },

  sectionTitle: {
    marginTop: 19,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },

  emptyCard: {
    minHeight: 130,
    padding: 20,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },

  emptyTitle: {
    marginTop: 9,
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },

  emptyText: {
    marginTop: 4,
    fontSize: 11,
    textAlign: 'center',
    color: '#94a3b8',
  },

  recordCard: {
    minHeight: 67,
    marginBottom: 8,
    padding: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  recordIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },

  recordInfo: {
    flex: 1,
    marginHorizontal: 10,
  },

  studentId: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },

  date: {
    marginTop: 3,
    fontSize: 10,
    color: '#64748b',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#dcfce7',
  },

  statusText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#15803d',
    textTransform: 'uppercase',
  },

  absentBadge: {
    backgroundColor: '#fee2e2',
  },

  absentText: {
    color: '#b91c1c',
  },
});
