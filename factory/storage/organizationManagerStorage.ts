import { db } from '@/services/firebase';
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

export const getOrganizationInstalledManagers = async (
  organizationId: string
): Promise<string[]> => {
  const managersSnap = await getDocs(
    collection(db, 'organizations', organizationId, 'managers')
  );

  return managersSnap.docs
    .filter(manager => manager.data().installed === true)
    .map(manager => manager.id);
};

export const installOrganizationManager = async ({
  organizationId,
  managerId,
  userId,
}: {
  organizationId: string;
  managerId: string;
  userId: string;
}): Promise<void> => {
  const managerRef = doc(
    db,
    'organizations',
    organizationId,
    'managers',
    managerId
  );

  await setDoc(
    managerRef,
    {
      managerId,
      installed: true,
      installedBy: userId,
      installedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const uninstallOrganizationManager = async ({
  organizationId,
  managerId,
}: {
  organizationId: string;
  managerId: string;
}): Promise<void> => {
  await setDoc(
    doc(
      db,
      'organizations',
      organizationId,
      'managers',
      managerId
    ),
    {
      installed: false,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};
