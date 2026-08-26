import { db } from '@/services/firebase';
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

export const getEnabledOrganizationManagerModules = async ({
  organizationId,
  managerId,
}: {
  organizationId: string;
  managerId: string;
}): Promise<string[]> => {
  const modulesSnap = await getDocs(
    collection(
      db,
      'organizations',
      organizationId,
      'managers',
      managerId,
      'modules'
    )
  );

  return modulesSnap.docs
    .filter(module => module.data().enabled === true)
    .map(module => module.id);
};

export const setOrganizationManagerModuleEnabled = async ({
  organizationId,
  managerId,
  moduleId,
  enabled,
  userId,
}: {
  organizationId: string;
  managerId: string;
  moduleId: string;
  enabled: boolean;
  userId: string;
}): Promise<void> => {
  await setDoc(
    doc(
      db,
      'organizations',
      organizationId,
      'managers',
      managerId,
      'modules',
      moduleId
    ),
    {
      moduleId,
      enabled,
      enabledBy: userId,
      enabledAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};
