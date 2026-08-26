import { db } from '@/services/firebase';
import type {
  OrganizationMemberRecord,
  OrganizationMemberStatus,
  OrganizationMemberType,
  OrganizationMemberWithProfile,
} from '@/modules/member-management/types/memberTypes';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';

type FirestoreUnsubscribe = () => void;

const toDate = (value: any): Date => {
  if (value?.toDate) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return new Date();
};

const toMemberRecord = (
  organizationId: string,
  userId: string,
  data: Record<string, any>
): OrganizationMemberRecord => ({
  organizationId,
  userId,
  memberType: data.memberType || 'member',
  status: data.status || 'active',
  joinedAt: toDate(data.joinedAt),
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
});

export const getOrganizationMembersPath = (
  organizationId: string
): string =>
  `organizations/${organizationId}/members`;

export const subscribeOrganizationMembers = ({
  organizationId,
  memberType,
  onChange,
  onError,
}: {
  organizationId: string;
  memberType?: OrganizationMemberType;
  onChange: (members: OrganizationMemberRecord[]) => void;
  onError?: (error: Error) => void;
}): FirestoreUnsubscribe => {
  const membersRef = collection(
    db,
    'organizations',
    organizationId,
    'members'
  );

  const membersQuery = memberType
    ? query(
        membersRef,
        where('memberType', '==', memberType),
        orderBy('joinedAt', 'desc')
      )
    : query(
        membersRef,
        orderBy('joinedAt', 'desc')
      );

  return onSnapshot(
    membersQuery,
    snapshot => {
      const members = snapshot.docs.map(memberDoc =>
        toMemberRecord(
          organizationId,
          memberDoc.id,
          memberDoc.data()
        )
      );

      onChange(members);
    },
    error => {
      onError?.(error);
    }
  );
};

export const resolveMemberProfiles = async (
  members: OrganizationMemberRecord[]
): Promise<OrganizationMemberWithProfile[]> => {
  const withProfiles = await Promise.all(
    members.map(async member => {
      const profileSnap = await getDoc(
        doc(db, 'users', member.userId)
      );

      if (!profileSnap.exists()) {
        return {
          ...member,
          profile: null,
        };
      }

      const profile = profileSnap.data();

      return {
        ...member,
        profile: {
          userId: member.userId,
          name: profile.name || '',
          phone: profile.phone || '',
          email: profile.email || '',
          profileUri: profile.profileUri || null,
        },
      };
    })
  );

  return withProfiles;
};

export const upsertOrganizationMember = async ({
  organizationId,
  userId,
  memberType,
  status = 'active',
}: {
  organizationId: string;
  userId: string;
  memberType: OrganizationMemberType;
  status?: OrganizationMemberStatus;
}): Promise<void> => {
  const now = new Date();

  await setDoc(
    doc(
      db,
      'organizations',
      organizationId,
      'members',
      userId
    ),
    {
      organizationId,
      userId,
      memberType,
      status,
      joinedAt: now,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );
};
