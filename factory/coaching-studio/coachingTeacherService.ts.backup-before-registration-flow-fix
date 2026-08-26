import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { db } from '@/services/firebase';
import type { CoachingTeacherProfile } from './types';

const COLLECTION_NAME = 'coachingTeacherProfiles';

export async function saveCoachingTeacherProfile(
  profile: CoachingTeacherProfile
): Promise<void> {
  if (!profile.serviceBazarUid) {
    throw new Error(
      'ServiceBazar user ID is required.'
    );
  }

  const profileRef = doc(
    db,
    COLLECTION_NAME,
    profile.serviceBazarUid
  );

  await setDoc(
    profileRef,
    {
      ...profile,
      updatedAt: serverTimestamp(),
      createdAt:
        profile.createdAt || serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}

export async function getCoachingTeacherProfile(
  serviceBazarUid: string
): Promise<CoachingTeacherProfile | null> {
  if (!serviceBazarUid) {
    return null;
  }

  const profileRef = doc(
    db,
    COLLECTION_NAME,
    serviceBazarUid
  );

  const snapshot = await getDoc(profileRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...(snapshot.data() as CoachingTeacherProfile),
    serviceBazarUid,
  };
}
