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
  createTeacher,
  subscribeTeachers,
  updateTeacherStatus,
} from '@/modules/teacher-management/services/teacherService';
import type { TeacherRecord } from '@/modules/teacher-management/types/teacherTypes';

type Props = {
  context: ManagerContext;
};

export default function TeacherManagementScreen({
  context,
}: Props) {
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (!context.organizationId) {
      setTeachers([]);
      setLoading(false);
      return;
    }

    return subscribeTeachers({
      organizationId: context.organizationId,
      onChange: records => {
        setTeachers(records);
        setLoading(false);
      },
      onError: error => {
        setLoading(false);
        Alert.alert(
          'Teachers',
          error.message || 'Unable to load teachers.'
        );
      },
    });
  }, [context.organizationId]);

  const handleCreate = async () => {
    if (!context.organizationId) {
      Alert.alert('Teachers', 'Organization is not available.');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Teachers', 'Teacher name is required.');
      return;
    }

    setSaving(true);

    try {
      await createTeacher({
        organizationId: context.organizationId,
        name,
        phone,
        subject,
      });

      setName('');
      setPhone('');
      setSubject('');

      Alert.alert('Success', 'Teacher created successfully.');
    } catch (error: any) {
      Alert.alert(
        'Teachers',
        error?.message || 'Unable to create teacher.'
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (teacher: TeacherRecord) => {
    if (!context.organizationId) return;

    try {
      await updateTeacherStatus({
        organizationId: context.organizationId,
        teacherId: teacher.id,
        status:
          teacher.status === 'active'
            ? 'inactive'
            : 'active',
      });
    } catch (error: any) {
      Alert.alert(
        'Teachers',
        error?.message || 'Unable to update teacher.'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Teacher Management</Text>
          <Text style={styles.subtitle}>
            Manage coaching teachers and faculty
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {teachers.length}
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Add Teacher</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Teacher name"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />

        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone"
          placeholderTextColor="#94a3b8"
          keyboardType="phone-pad"
          style={styles.input}
        />

        <TextInput
          value={subject}
          onChangeText={setSubject}
          placeholder="Subject / Specialization"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />

        <TouchableOpacity
          onPress={handleCreate}
          disabled={saving}
          activeOpacity={0.85}
          style={styles.button}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name="person-add-outline"
                size={18}
                color="#fff"
              />
              <Text style={styles.buttonText}>
                Add Teacher
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Teachers</Text>

      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator color="#4f46e5" />
        </View>
      ) : teachers.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons
            name="people-outline"
            size={38}
            color="#6366f1"
          />
          <Text style={styles.emptyTitle}>
            No teachers yet
          </Text>
          <Text style={styles.emptyText}>
            Add your first teacher above.
          </Text>
        </View>
      ) : (
        teachers.map(teacher => (
          <TouchableOpacity
            key={teacher.id}
            onPress={() => toggleStatus(teacher)}
            activeOpacity={0.85}
            style={styles.teacherCard}
          >
            <View style={styles.iconBox}>
              <Ionicons
                name="person-outline"
                size={23}
                color="#4f46e5"
              />
            </View>

            <View style={styles.info}>
              <Text style={styles.name}>
                {teacher.name}
              </Text>

              {!!teacher.subject && (
                <Text style={styles.meta}>
                  {teacher.subject}
                </Text>
              )}

              {!!teacher.phone && (
                <Text style={styles.meta}>
                  {teacher.phone}
                </Text>
              )}
            </View>

            <View
              style={[
                styles.status,
                teacher.status === 'inactive' &&
                  styles.inactive,
              ]}
            >
              <Text style={styles.statusText}>
                {teacher.status}
              </Text>
            </View>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    minWidth: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#4f46e5',
  },
  form: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginBottom: 14,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 10,
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
  button: {
    minHeight: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4f46e5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  sectionTitle: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  empty: {
    padding: 22,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  emptyText: {
    marginTop: 4,
    fontSize: 12,
    color: '#94a3b8',
  },
  teacherCard: {
    minHeight: 76,
    marginBottom: 9,
    padding: 12,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },
  info: {
    flex: 1,
    marginHorizontal: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },
  meta: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748b',
  },
  status: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: '#dcfce7',
  },
  inactive: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#166534',
    textTransform: 'uppercase',
  },
});
