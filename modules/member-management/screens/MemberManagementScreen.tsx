import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type {
  MemberManagementContext,
  OrganizationMemberType,
  OrganizationMemberWithProfile,
} from '@/modules/member-management/types/memberTypes';
import {
  canManageOrganizationMembers,
  canViewOrganizationMembers,
} from '@/modules/member-management/permissions/memberPermissions';
import {
  getOrganizationMembersPath,
  resolveMemberProfiles,
  subscribeOrganizationMembers,
  upsertOrganizationMember,
} from '@/modules/member-management/services/memberService';

type Props = {
  context: MemberManagementContext;
  memberType: OrganizationMemberType;
  title: string;
  singularLabel: string;
  pluralLabel: string;
};

export default function MemberManagementScreen({
  context,
  memberType,
  title,
  singularLabel,
  pluralLabel,
}: Props) {
  const [members, setMembers] = useState<OrganizationMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  const canView = canViewOrganizationMembers(context.role);
  const canManage = canManageOrganizationMembers(context.role);

  useEffect(() => {
    if (!canView || !context.organizationId) {
      setLoading(false);
      return;
    }

    let active = true;

    const unsubscribe = subscribeOrganizationMembers({
      organizationId: context.organizationId,
      memberType,
      onChange: async records => {
        try {
          const resolved =
            await resolveMemberProfiles(records);

          if (active) {
            setMembers(resolved);
            setErrorText('');
            setLoading(false);
          }
        } catch (error: any) {
          if (active) {
            setErrorText(
              error?.message ||
                `${pluralLabel} profile details could not be loaded.`
            );
            setLoading(false);
          }
        }
      },
      onError: error => {
        if (active) {
          setErrorText(error.message);
          setLoading(false);
        }
      },
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [
    canView,
    context.organizationId,
    memberType,
    pluralLabel,
  ]);

  const activeCount = useMemo(
    () => members.filter(member => member.status === 'active').length,
    [members]
  );

  const inactiveCount = members.length - activeCount;

  const showEnrollmentEntry = () => {
    Alert.prompt(
      `Add ${singularLabel}`,
      `Enter the ServiceBazar user ID to add as a ${singularLabel.toLowerCase()}.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add',
          onPress: async (userId?: string) => {
            const normalizedUserId = userId?.trim();

            if (!normalizedUserId) {
              Alert.alert(
                `Add ${singularLabel}`,
                'User ID is required.'
              );
              return;
            }

            if (!context.organizationId) {
              Alert.alert(
                `Add ${singularLabel}`,
                'Organization is not available.'
              );
              return;
            }

            try {
              await upsertOrganizationMember({
                organizationId: context.organizationId,
                userId: normalizedUserId,
                memberType,
                status: 'active',
              });

              Alert.alert(
                'Success',
                `${singularLabel} added successfully.`
              );
            } catch (error: any) {
              Alert.alert(
                `Add ${singularLabel}`,
                error?.message || 'Unable to add member.'
              );
            }
          },
        },
      ],
      'plain-text'
    );
  };

  if (!canView) {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardText}>
          Your role can not view this organization's {pluralLabel.toLowerCase()} yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>
            Uses {getOrganizationMembersPath(context.organizationId)}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!canManage}
          onPress={showEnrollmentEntry}
          style={[
            styles.addButton,
            !canManage && styles.disabledButton,
          ]}
        >
          <Ionicons
            name="person-add-outline"
            size={16}
            color="#ffffff"
          />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{members.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{activeCount}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{inactiveCount}</Text>
          <Text style={styles.statLabel}>Inactive</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.card}>
          <ActivityIndicator color="#4f46e5" />
          <Text style={styles.loadingText}>
            Loading {pluralLabel.toLowerCase()}...
          </Text>
        </View>
      ) : errorText ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {pluralLabel} unavailable
          </Text>
          <Text style={styles.cardText}>{errorText}</Text>
        </View>
      ) : members.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            No {pluralLabel.toLowerCase()} yet
          </Text>
          <Text style={styles.cardText}>
            Add an existing ServiceBazar customer as a {singularLabel.toLowerCase()} for this organization.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.memberList}
        >
          {members.map(member => (
            <TouchableOpacity
              key={member.userId}
              activeOpacity={0.85}
              onPress={() =>
                Alert.alert(
                  singularLabel,
                  member.profile?.name ||
                    `User ID: ${member.userId}`
                )
              }
              style={styles.memberCard}
            >
              <View style={styles.avatar}>
                <Ionicons
                  name="person-outline"
                  size={22}
                  color="#4f46e5"
                />
              </View>

              <Text style={styles.memberName} numberOfLines={1}>
                {member.profile?.name || 'ServiceBazar User'}
              </Text>

              <Text style={styles.memberMeta} numberOfLines={1}>
                {member.profile?.phone || member.userId}
              </Text>

              <Text
                style={[
                  styles.status,
                  member.status === 'inactive' && styles.inactiveStatus,
                ]}
              >
                {member.status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },

  sectionHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },

  sectionSubtitle: {
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
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4f46e5',
  },

  disabledButton: {
    opacity: 0.5,
  },

  addButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#ffffff',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  statCard: {
    flex: 1,
    minHeight: 78,
    padding: 13,
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

  loadingText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b',
  },

  memberList: {
    gap: 10,
    paddingRight: 16,
  },

  memberCard: {
    width: 152,
    minHeight: 142,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#ffffff',
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff',
    marginBottom: 10,
  },

  memberName: {
    fontSize: 13,
    fontWeight: '900',
    color: '#111827',
  },

  memberMeta: {
    marginTop: 4,
    fontSize: 11,
    color: '#64748b',
  },

  status: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: '#dcfce7',
    fontSize: 10,
    fontWeight: '900',
    color: '#15803d',
  },

  inactiveStatus: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
});
