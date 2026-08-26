import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { ManagerContext } from '@/factory/types/managerTypes';
import type { CourseRecord } from '@/modules/course-management/types/courseTypes';
import {
  createCourse,
  subscribeCourses,
  updateCourse,
} from '@/modules/course-management/services/courseService';

type Props = {
  context: ManagerContext;
};

export default function CourseManagementScreen({ context }: Props) {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [fee, setFee] = useState('');

  useEffect(() => {
    if (!context.organizationId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeCourses({
      organizationId: context.organizationId,
      onChange: nextCourses => {
        setCourses(nextCourses);
        setLoading(false);
      },
      onError: error => {
        setLoading(false);
        Alert.alert('Courses', error.message);
      },
    });

    return unsubscribe;
  }, [context.organizationId]);

  const addCourse = async () => {
    if (!context.organizationId) {
      Alert.alert('Courses', 'Organization is not available.');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Courses', 'Course name is required.');
      return;
    }

    setSaving(true);

    try {
      await createCourse({
        organizationId: context.organizationId,
        name,
        description,
        duration,
        fee: Number(fee) || 0,
      });

      setName('');
      setDescription('');
      setDuration('');
      setFee('');

      Alert.alert('Success', 'Course created successfully.');
    } catch (error: any) {
      Alert.alert(
        'Courses',
        error?.message || 'Unable to create course.'
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleCourse = async (course: CourseRecord) => {
    if (!context.organizationId) return;

    try {
      await updateCourse({
        organizationId: context.organizationId,
        courseId: course.id,
        changes: {
          status:
            course.status === 'active'
              ? 'inactive'
              : 'active',
        },
      });
    } catch (error: any) {
      Alert.alert(
        'Courses',
        error?.message || 'Unable to update course.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Course Management</Text>
          <Text style={styles.subtitle}>
            Create and manage your coaching courses
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{courses.length}</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Add Course</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Course name"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          placeholderTextColor="#94a3b8"
          multiline
          style={[styles.input, styles.multiline]}
        />

        <View style={styles.row}>
          <TextInput
            value={duration}
            onChangeText={setDuration}
            placeholder="Duration"
            placeholderTextColor="#94a3b8"
            style={[styles.input, styles.halfInput]}
          />

          <TextInput
            value={fee}
            onChangeText={setFee}
            placeholder="Fee"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={saving}
          onPress={addCourse}
          style={[
            styles.primaryButton,
            saving && styles.disabledButton,
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Ionicons
                name="add-circle-outline"
                size={18}
                color="#ffffff"
              />
              <Text style={styles.primaryButtonText}>
                Create Course
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Courses</Text>

      {loading ? (
        <View style={styles.emptyCard}>
          <ActivityIndicator color="#4f46e5" />
          <Text style={styles.emptyText}>
            Loading courses...
          </Text>
        </View>
      ) : courses.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons
            name="school-outline"
            size={38}
            color="#6366f1"
          />
          <Text style={styles.emptyTitle}>
            No courses yet
          </Text>
          <Text style={styles.emptyText}>
            Create your first coaching course above.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {courses.map(course => (
            <View key={course.id} style={styles.courseCard}>
              <View style={styles.courseIcon}>
                <Ionicons
                  name="book-outline"
                  size={24}
                  color="#4f46e5"
                />
              </View>

              <View style={styles.courseInfo}>
                <Text style={styles.courseName}>
                  {course.name}
                </Text>

                {!!course.description && (
                  <Text
                    style={styles.courseDescription}
                    numberOfLines={2}
                  >
                    {course.description}
                  </Text>
                )}

                <Text style={styles.courseMeta}>
                  {course.duration || 'Duration not set'} · ₹
                  {course.fee}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => toggleCourse(course)}
                style={[
                  styles.statusButton,
                  course.status === 'inactive' &&
                    styles.inactiveButton,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    course.status === 'inactive' &&
                      styles.inactiveText,
                  ]}
                >
                  {course.status}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#64748b',
  },
  countBadge: {
    minWidth: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },
  countText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#4f46e5',
  },
  formCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 18,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    minHeight: 46,
    paddingHorizontal: 13,
    borderRadius: 13,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#111827',
    fontSize: 13,
    marginBottom: 10,
  },
  multiline: {
    minHeight: 70,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#4f46e5',
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  list: {
    gap: 10,
    paddingBottom: 20,
  },
  courseCard: {
    minHeight: 92,
    padding: 13,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  courseIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },
  courseInfo: {
    flex: 1,
    marginHorizontal: 11,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },
  courseDescription: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: '#64748b',
  },
  courseMeta: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: '700',
    color: '#4f46e5',
  },
  statusButton: {
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: '#dcfce7',
  },
  inactiveButton: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#15803d',
  },
  inactiveText: {
    color: '#dc2626',
  },
  emptyCard: {
    padding: 28,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  emptyText: {
    marginTop: 7,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
});
