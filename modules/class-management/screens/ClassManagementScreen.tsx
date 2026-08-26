import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  createClass,
  subscribeClasses,
} from '@/modules/class-management/services/classService';
import type { ClassRecord } from '@/modules/class-management/types/classTypes';

type Props = {
  context: {
    organizationId?: string;
  };
};

export default function ClassManagementScreen({
  context,
}: Props) {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!context.organizationId) {
      setClasses([]);
      return;
    }

    return subscribeClasses({
      organizationId: context.organizationId,
      onChange: setClasses,
    });
  }, [context.organizationId]);

  const handleCreate = async () => {
    if (!context.organizationId) {
      Alert.alert('Error', 'Organization not available.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Required', 'Enter class title.');
      return;
    }

    setSaving(true);

    try {
      await createClass({
        organizationId: context.organizationId,
        courseId: courseId.trim(),
        batchId: batchId.trim(),
        title: title.trim(),
        teacherName: teacherName.trim(),
        scheduledAt: new Date(),
      });

      setTitle('');
      setCourseId('');
      setBatchId('');
      setTeacherName('');

      Alert.alert('Success', 'Class created.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to create class.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Class Management</Text>

      <Text style={styles.subtitle}>
        Schedule and manage coaching classes.
      </Text>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Class title"
        style={styles.input}
      />

      <TextInput
        value={courseId}
        onChangeText={setCourseId}
        placeholder="Course ID"
        style={styles.input}
      />

      <TextInput
        value={batchId}
        onChangeText={setBatchId}
        placeholder="Batch ID"
        style={styles.input}
      />

      <TextInput
        value={teacherName}
        onChangeText={setTeacherName}
        placeholder="Teacher name"
        style={styles.input}
      />

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleCreate}
        disabled={saving}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Creating...' : 'Create Class'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>
        Scheduled Classes ({classes.length})
      </Text>

      {classes.length === 0 ? (
        <Text style={styles.empty}>
          No classes created yet.
        </Text>
      ) : (
        classes.map(item => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>
              {item.title}
            </Text>

            <Text style={styles.cardText}>
              Course: {item.courseId || 'Not assigned'}
            </Text>

            <Text style={styles.cardText}>
              Batch: {item.batchId || 'Not assigned'}
            </Text>

            <Text style={styles.cardText}>
              Teacher: {item.teacherName || 'Not assigned'}
            </Text>

            <Text style={styles.status}>
              {item.status}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    marginBottom: 14,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },

  title: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },

  subtitle: {
    marginTop: 4,
    marginBottom: 14,
    fontSize: 12,
    color: '#64748b',
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f46e5',
  },

  buttonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
  },

  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },

  empty: {
    fontSize: 12,
    color: '#94a3b8',
  },

  card: {
    marginBottom: 9,
    padding: 13,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },

  cardText: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748b',
  },

  status: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '800',
    color: '#4f46e5',
    textTransform: 'uppercase',
  },
});
