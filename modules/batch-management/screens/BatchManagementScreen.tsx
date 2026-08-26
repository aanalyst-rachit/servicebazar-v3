import React, { useEffect, useMemo, useState } from 'react';
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
  createBatch,
  subscribeBatches,
  updateBatchStatus,
} from '@/modules/batch-management/services/batchService';
import type { BatchRecord } from '@/modules/batch-management/types/batchTypes';
import type { MemberManagementContext } from '@/modules/member-management/types/memberTypes';
import { canManageOrganizationMembers } from '@/modules/member-management/permissions/memberPermissions';

type Props = {
  context: MemberManagementContext;
};

export default function BatchManagementScreen({ context }: Props) {
  const [batches, setBatches] = useState<BatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  const canManage = canManageOrganizationMembers(context.role);

  useEffect(() => {
    if (!context.organizationId) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeBatches({
      organizationId: context.organizationId,
      onChange: records => {
        setBatches(records);
        setLoading(false);
        setErrorText('');
      },
      onError: error => {
        setErrorText(error.message);
        setLoading(false);
      },
    });

    return unsubscribe;
  }, [context.organizationId]);

  const activeCount = useMemo(
    () => batches.filter(batch => batch.status === 'active').length,
    [batches]
  );

  const addBatch = async () => {
    if (!canManage) {
      Alert.alert('Permission denied', 'You cannot create batches.');
      return;
    }

    if (!context.organizationId) return;

    try {
      await createBatch({
        organizationId: context.organizationId,
        name: `New Batch ${batches.length + 1}`,
        courseId: '',
        startDate: new Date(),
      });
    } catch (error: any) {
      Alert.alert('Unable to create batch', error?.message || 'Please try again.');
    }
  };

  const toggleBatch = async (batch: BatchRecord) => {
    if (!canManage || !context.organizationId) return;

    try {
      await updateBatchStatus({
        organizationId: context.organizationId,
        batchId: batch.id,
        status: batch.status === 'active' ? 'inactive' : 'active',
      });
    } catch (error: any) {
      Alert.alert('Unable to update batch', error?.message || 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Batches</Text>
          <Text style={styles.subtitle}>
            {batches.length} total · {activeCount} active
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addButton, !canManage && styles.disabled]}
          onPress={addBatch}
          disabled={!canManage}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.card}>
          <ActivityIndicator color="#4f46e5" />
          <Text style={styles.muted}>Loading batches...</Text>
        </View>
      ) : errorText ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Batches unavailable</Text>
          <Text style={styles.muted}>{errorText}</Text>
        </View>
      ) : batches.length === 0 ? (
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Ionicons name="people-outline" size={26} color="#4f46e5" />
          </View>
          <Text style={styles.cardTitle}>No batches yet</Text>
          <Text style={styles.muted}>
            Create your first batch to organize students into classes.
          </Text>
        </View>
      ) : (
        batches.map(batch => (
          <TouchableOpacity
            key={batch.id}
            style={styles.batchCard}
            activeOpacity={0.85}
            onPress={() => toggleBatch(batch)}
          >
            <View style={styles.batchIcon}>
              <Ionicons name="people-outline" size={23} color="#4f46e5" />
            </View>

            <View style={styles.info}>
              <Text style={styles.batchName} numberOfLines={1}>
                {batch.name}
              </Text>
              <Text style={styles.course}>
                {batch.courseId || 'Course not assigned'}
              </Text>
            </View>

            <View
              style={[
                styles.status,
                batch.status === 'inactive' && styles.inactive,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  batch.status === 'inactive' && styles.inactiveText,
                ]}
              >
                {batch.status}
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
  addButton: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#4f46e5',
  },
  disabled: {
    opacity: 0.45,
  },
  addText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  card: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 6,
  },
  muted: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748b',
    textAlign: 'center',
  },
  batchCard: {
    minHeight: 76,
    marginBottom: 10,
    padding: 12,
    borderRadius: 17,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  batchIcon: {
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
  batchName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },
  course: {
    marginTop: 4,
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
    fontSize: 10,
    fontWeight: '900',
    color: '#15803d',
  },
  inactiveText: {
    color: '#dc2626',
  },
});
