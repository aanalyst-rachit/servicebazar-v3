import React, { useEffect, useMemo, useState } from 'react';
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
  createFee,
  subscribeFees,
} from '@/modules/fees-management/services/feeService';
import type { FeeRecord } from '@/modules/fees-management/types/feeTypes';

type Props = {
  context: ManagerContext;
};

export default function FeesManagementScreen({
  context,
}: Props) {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [studentUserId, setStudentUserId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [amount, setAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');

  useEffect(() => {
    if (!context.organizationId) {
      setFees([]);
      setLoading(false);
      return;
    }

    return subscribeFees({
      organizationId: context.organizationId,
      onChange: records => {
        setFees(records);
        setLoading(false);
      },
      onError: error => {
        setLoading(false);
        Alert.alert(
          'Fees',
          error.message || 'Unable to load fees.'
        );
      },
    });
  }, [context.organizationId]);

  const totals = useMemo(() => {
    return fees.reduce(
      (result, item) => ({
        billed: result.billed + item.amount,
        collected: result.collected + item.paidAmount,
        pending:
          result.pending +
          Math.max(item.amount - item.paidAmount, 0),
      }),
      {
        billed: 0,
        collected: 0,
        pending: 0,
      }
    );
  }, [fees]);

  const handleCreate = async () => {
    if (!context.organizationId) {
      Alert.alert('Fees', 'Organization is not available.');
      return;
    }

    if (!studentUserId.trim()) {
      Alert.alert('Fees', 'Student User ID is required.');
      return;
    }

    const safeAmount = Number(amount);

    if (!safeAmount || safeAmount <= 0) {
      Alert.alert('Fees', 'Enter a valid fee amount.');
      return;
    }

    setSaving(true);

    try {
      await createFee({
        organizationId: context.organizationId,
        studentUserId,
        courseId,
        amount: safeAmount,
        paidAmount: Number(paidAmount) || 0,
      });

      setStudentUserId('');
      setCourseId('');
      setAmount('');
      setPaidAmount('');

      Alert.alert('Success', 'Fee record created.');
    } catch (error: any) {
      Alert.alert(
        'Fees',
        error?.message || 'Unable to create fee record.'
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
            name="wallet-outline"
            size={23}
            color="#4f46e5"
          />
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.title}>Fees Management</Text>
          <Text style={styles.subtitle}>
            Track student fees and collections
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{fees.length}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            ₹{totals.billed}
          </Text>
          <Text style={styles.statLabel}>Billed</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            ₹{totals.collected}
          </Text>
          <Text style={styles.statLabel}>Collected</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.pendingValue}>
            ₹{totals.pending}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Record Fee</Text>

        <TextInput
          value={studentUserId}
          onChangeText={setStudentUserId}
          placeholder="Student User ID"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />

        <TextInput
          value={courseId}
          onChangeText={setCourseId}
          placeholder="Course ID (optional)"
          placeholderTextColor="#94a3b8"
          style={styles.input}
        />

        <View style={styles.row}>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="Total fee"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
          />

          <TextInput
            value={paidAmount}
            onChangeText={setPaidAmount}
            placeholder="Paid now"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            style={[styles.input, styles.halfInput]}
          />
        </View>

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
                name="add-circle-outline"
                size={18}
                color="#ffffff"
              />
              <Text style={styles.buttonText}>
                Record Fee
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Fees</Text>

      {loading ? (
        <View style={styles.emptyCard}>
          <ActivityIndicator color="#4f46e5" />
          <Text style={styles.muted}>Loading fees...</Text>
        </View>
      ) : fees.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons
            name="receipt-outline"
            size={36}
            color="#6366f1"
          />
          <Text style={styles.emptyTitle}>
            No fee records yet
          </Text>
          <Text style={styles.muted}>
            Record the first student fee above.
          </Text>
        </View>
      ) : (
        fees.slice(0, 10).map(fee => (
          <View key={fee.id} style={styles.feeCard}>
            <View style={styles.feeIcon}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#4f46e5"
              />
            </View>

            <View style={styles.feeInfo}>
              <Text style={styles.student}>
                {fee.studentUserId}
              </Text>

              <Text style={styles.meta}>
                Course: {fee.courseId || 'Not assigned'}
              </Text>

              <Text style={styles.meta}>
                ₹{fee.paidAmount} paid / ₹{fee.amount}
              </Text>
            </View>

            <View
              style={[
                styles.status,
                fee.status === 'paid' && styles.paid,
                fee.status === 'partial' && styles.partial,
              ]}
            >
              <Text style={styles.statusText}>
                {fee.status}
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
  countBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },
  countText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#4f46e5',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 11,
    borderRadius: 15,
    backgroundColor: '#ffffff',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  pendingValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#b45309',
  },
  statLabel: {
    marginTop: 3,
    fontSize: 10,
    color: '#64748b',
  },
  formCard: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginBottom: 14,
  },
  formTitle: {
    marginBottom: 11,
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
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
  row: {
    flexDirection: 'row',
    gap: 9,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#4f46e5',
  },
  disabled: {
    opacity: 0.55,
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
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  muted: {
    marginTop: 5,
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
  },
  feeCard: {
    minHeight: 72,
    marginBottom: 9,
    padding: 11,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
  },
  feeInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  student: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },
  meta: {
    marginTop: 3,
    fontSize: 10,
    color: '#64748b',
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
  },
  paid: {
    backgroundColor: '#dcfce7',
  },
  partial: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#334155',
    textTransform: 'uppercase',
  },
});
