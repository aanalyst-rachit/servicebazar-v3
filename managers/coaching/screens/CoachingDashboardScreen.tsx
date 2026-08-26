import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import CoachingStudentManagementScreen from '@/managers/coaching/screens/CoachingStudentManagementScreen';
import CourseManagementScreen from '@/modules/course-management/screens/CourseManagementScreen';
import { EnrollmentScreen } from '@/modules/enrollment';
import CoachingBatchManagementScreen from '@/managers/coaching/screens/BatchManagementScreen';
import FeesManagementScreen from '@/modules/fees-management/screens/FeesManagementScreen';
import TeacherManagementScreen from '@/modules/teacher-management/screens/TeacherManagementScreen';
import { ClassManagementScreen } from '@/modules/class-management';
import { AttendanceManagementScreen } from '@/modules/attendance-management';
import { NotificationManagementScreen } from '@/modules/notification-management';
import type { CoachingManagerContext } from '@/managers/coaching/types/coachingTypes';
import { subscribeCourses } from '@/modules/course-management/services/courseService';
import { subscribeBatches } from '@/modules/batch-management/services/batchService';
import { subscribeClasses } from '@/modules/class-management/services/classService';

type Props = {
  context: CoachingManagerContext;
  organizationName?: string;
};

const getRoleTitle = (role: CoachingManagerContext['role']) => {
  switch (role) {
    case 'owner':
      return 'Coaching Owner';
    case 'admin':
      return 'Coaching Admin';
    case 'teacher':
      return 'Teacher';
    case 'staff':
      return 'Coaching Staff';
    case 'member':
      return 'Student';
    default:
      return 'Coaching Manager';
  }
};

export default function CoachingDashboardScreen({
  context,
  organizationName = 'My Coaching',
}: Props) {
  const [courseCount, setCourseCount] = useState(0);
  const [batchCount, setBatchCount] = useState(0);
  const [classCount, setClassCount] = useState(0);

  const enabledModules = new Set(context.enabledModules);

  const isModuleEnabled = (moduleId: string) =>
    enabledModules.has(moduleId);

  useEffect(() => {
    if (!context.organizationId) {
      setCourseCount(0);
      setBatchCount(0);
      setClassCount(0);
      return;
    }

    const organizationId = context.organizationId;

    const unsubscribeCourses = subscribeCourses({
      organizationId,
      onChange: courses => setCourseCount(courses.length),
    });

    const unsubscribeBatches = subscribeBatches({
      organizationId,
      onChange: batches => setBatchCount(batches.length),
    });

    const unsubscribeClasses = subscribeClasses({
      organizationId,
      onChange: classes => setClassCount(classes.length),
    });

    return () => {
      unsubscribeCourses();
      unsubscribeBatches();
      unsubscribeClasses();
    };
  }, [context.organizationId]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>COACHING MANAGER</Text>

        <Text style={styles.title}>
          {organizationName}
        </Text>

        <Text style={styles.role}>
          {getRoleTitle(context.role)}
        </Text>
      </View>

      <CoachingStudentManagementScreen
        context={context}
      />

      <CourseManagementScreen
        context={context}
      />

      <EnrollmentScreen
        context={context}
      />

      <CoachingBatchManagementScreen
        context={context}
      />

      {isModuleEnabled('class-management') && (
        <ClassManagementScreen
          context={context}
        />
      )}

      {isModuleEnabled('teacher-management') && (
        <TeacherManagementScreen
          context={context}
        />
      )}

      {isModuleEnabled('fees-management') && (
        <FeesManagementScreen
          context={context}
        />
      )}

      {isModuleEnabled('attendance-management') && (
        <AttendanceManagementScreen
          context={context}
        />
      )}

      {isModuleEnabled('notification-management') && (
        <NotificationManagementScreen
          context={context}
        />
      )}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{courseCount}</Text>
          <Text style={styles.statLabel}>Courses</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{batchCount}</Text>
          <Text style={styles.statLabel}>Batches</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{classCount}</Text>
          <Text style={styles.statLabel}>Classes</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Manager Status
        </Text>

        <Text style={styles.cardText}>
          Coaching Manager is active and ready for
          module configuration.
        </Text>

        <Text style={styles.moduleCount}>
          {context.enabledModules.length} optional module
          {context.enabledModules.length === 1 ? '' : 's'} enabled
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Next Modules
        </Text>

        <Text style={styles.cardText}>
          Student Management → Enrollment → Courses
          → Batches
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#f8fafc',
    flexGrow: 1,
  },

  hero: {
    padding: 22,
    borderRadius: 24,
    backgroundColor: '#111827',
    marginBottom: 14,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#a5b4fc',
    marginBottom: 6,
  },

  title: {
    fontSize: 25,
    fontWeight: '900',
    color: '#ffffff',
  },

  role: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: '700',
    color: '#cbd5e1',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  statCard: {
    flex: 1,
    minHeight: 82,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },

  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },

  statLabel: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },

  card: {
    padding: 18,
    marginBottom: 14,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 7,
  },

  cardText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
  },

  moduleCount: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '800',
    color: '#4f46e5',
  },
});
