import type {
  OrganizationMembership,
  OrganizationRecord,
} from '@/modules/organization/types/organizationTypes';
import { db } from '@/services/firebase';
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';

const isManagerRole = (value: unknown): value is OrganizationMembership['role'] =>
  ['owner', 'admin', 'teacher', 'staff', 'member'].includes(
    String(value)
  );

const toOrganization = (
  id: string,
  data: Record<string, any>
): OrganizationRecord => ({
  id,
  ownerId: String(data.ownerId || ''),
  type: data.type === 'coaching' ? 'coaching' : 'provider-business',
  name: String(data.name || ''),
  legacyProviderUid: String(data.legacyProviderUid || ''),
  legacyShopPhone: String(data.legacyShopPhone || ''),
  status: data.status === 'inactive' ? 'inactive' : 'active',
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
});

const toMembership = (
  organizationId: string,
  userId: string,
  data: Record<string, any>
): OrganizationMembership => ({
  organizationId,
  userId,
  role: isManagerRole(data.role) ? data.role : 'member',
  status: data.status === 'inactive' ? 'inactive' : 'active',
  joinedAt: data.joinedAt,
  createdAt: data.createdAt,
  updatedAt: data.updatedAt,
});

export const getOrganization = async (
  organizationId: string
): Promise<OrganizationRecord | null> => {
  const organizationSnap = await getDoc(
    doc(db, 'organizations', organizationId)
  );

  return organizationSnap.exists()
    ? toOrganization(organizationSnap.id, organizationSnap.data())
    : null;
};

/**
 * Creates the current provider's deterministic organization only when it does
 * not already exist. Existing management subcollections remain untouched.
 */
export const getOrCreateOrganization = async (
  firebaseUid: string
): Promise<OrganizationRecord> => {
  if (!firebaseUid) {
    throw new Error('An authenticated Firebase user is required.');
  }

  return runTransaction(db, async transaction => {
    const userRef = doc(db, 'users', firebaseUid);
    const organizationRef = doc(db, 'organizations', firebaseUid);
    const [userSnap, organizationSnap] = await Promise.all([
      transaction.get(userRef),
      transaction.get(organizationRef),
    ]);

    if (organizationSnap.exists()) {
      return toOrganization(organizationSnap.id, organizationSnap.data());
    }

    if (!userSnap.exists()) {
      throw new Error('The authenticated user profile is unavailable.');
    }

    const user = userSnap.data();

    if (user.role !== 'provider') {
      throw new Error(
        'Only a provider can initialize a provider-business organization.'
      );
    }

    const organization = {
      ownerId: firebaseUid,
      type: 'provider-business' as const,
      name: String(user.businessName || user.shopName || user.name || ''),
      legacyProviderUid: firebaseUid,
      legacyShopPhone: String(user.phone || user.mobileNumber || ''),
      status: 'active' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    transaction.set(organizationRef, organization);

    return {
      id: firebaseUid,
      ...organization,
    };
  });
};

export const getOrganizationMembership = async (
  organizationId: string,
  userId: string
): Promise<OrganizationMembership | null> => {
  const membershipSnap = await getDoc(
    doc(db, 'organizations', organizationId, 'members', userId)
  );

  return membershipSnap.exists()
    ? toMembership(organizationId, userId, membershipSnap.data())
    : null;
};

/**
 * Establishes only the provider owner's initial membership. An existing
 * membership is returned unchanged so its role is never silently elevated.
 */
export const ensureOwnerMembership = async ({
  organizationId,
  userId,
}: {
  organizationId: string;
  userId: string;
}): Promise<OrganizationMembership> =>
  runTransaction(db, async transaction => {
    const organizationRef = doc(db, 'organizations', organizationId);
    const membershipRef = doc(
      db,
      'organizations',
      organizationId,
      'members',
      userId
    );
    const [organizationSnap, membershipSnap] = await Promise.all([
      transaction.get(organizationRef),
      transaction.get(membershipRef),
    ]);

    if (!organizationSnap.exists()) {
      throw new Error('Organization is unavailable.');
    }

    if (membershipSnap.exists()) {
      return toMembership(organizationId, userId, membershipSnap.data());
    }

    const organization = organizationSnap.data();

    if (organization.ownerId !== userId) {
      throw new Error('Organization membership is unavailable.');
    }

    const membership = {
      userId,
      role: 'owner' as const,
      status: 'active' as const,
      joinedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    transaction.set(membershipRef, membership);

    return {
      organizationId,
      ...membership,
    };
  });
