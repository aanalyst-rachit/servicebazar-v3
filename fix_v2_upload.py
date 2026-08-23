from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent


def backup(path: Path):
    if path.exists():
        bak = path.with_suffix(path.suffix + ".v2fix.bak")
        shutil.copy2(path, bak)
        print(f"BACKUP: {path} -> {bak}")


def write_file(relative: str, content: str):
    path = ROOT / relative
    backup(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"FIXED : {path}")


# ============================================================
# 1. CLOUDINARY
# ============================================================
#
# IMPORTANT:
# We intentionally do NOT use React Native FormData here.
#
# Expo FileSystem's legacy uploadAsync handles the local
# file:// URI as multipart/form-data itself.
#
# This avoids:
#   Unsupported FormDataPart implementation
#
# ============================================================

cloudinary_ts = r'''import * as FileSystem from 'expo-file-system/legacy';

export const CLOUDINARY_CLOUD_NAME = 'mc6tawmp';
export const CLOUDINARY_UPLOAD_PRESET = 'service_app_feed';

export type CloudinaryMediaType = 'image' | 'video';

export const uploadMediaToCloudinary = async (
  localUri: string,
  mediaType: CloudinaryMediaType = 'image'
): Promise<string> => {
  if (!localUri) {
    throw new Error('Cloudinary upload: local URI missing.');
  }

  const resourceType = mediaType === 'video' ? 'video' : 'image';

  const uploadUrl =
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  console.log('Cloudinary upload started:', {
    localUri,
    mediaType,
    resourceType,
    uploadUrl,
  });

  try {
    const fileInfo = await FileSystem.getInfoAsync(localUri);

    if (!fileInfo.exists) {
      throw new Error(`Local media file does not exist: ${localUri}`);
    }

    console.log('Cloudinary local file verified:', {
      uri: localUri,
      size: 'size' in fileInfo ? fileInfo.size : undefined,
    });

    const result = await FileSystem.uploadAsync(
      uploadUrl,
      localUri,
      {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        parameters: {
          upload_preset: CLOUDINARY_UPLOAD_PRESET,
        },
      }
    );

    console.log('Cloudinary raw response:', {
      status: result.status,
      bodyPreview: result.body?.slice?.(0, 500),
    });

    if (result.status < 200 || result.status >= 300) {
      throw new Error(
        `Cloudinary upload failed (${result.status}): ${result.body}`
      );
    }

    let data: any;

    try {
      data = JSON.parse(result.body);
    } catch {
      throw new Error(
        `Cloudinary returned invalid JSON: ${result.body}`
      );
    }

    if (!data?.secure_url && !data?.url) {
      throw new Error(
        `Cloudinary upload succeeded but no URL was returned: ${result.body}`
      );
    }

    const cloudinaryUrl = data.secure_url || data.url;

    console.log('Cloudinary upload successful:', {
      url: cloudinaryUrl,
      public_id: data.public_id,
      resource_type: data.resource_type,
    });

    return cloudinaryUrl;
  } catch (error: any) {
    console.error('Cloudinary upload error:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      error,
    });

    throw error;
  }
};
'''

write_file("services/cloudinary.ts", cloudinary_ts)


# ============================================================
# 2. STORAGE SERVICE
# ============================================================
#
# Keep the old function names so the rest of the app does not
# need to change.
#
# Firebase Auth is still used only to verify that the anonymous
# Firebase user exists.
#
# Actual media storage = Cloudinary.
#
# ============================================================

storage_ts = r'''import { uploadMediaToCloudinary } from '@/services/cloudinary';
import { auth } from '@/services/firebase';

// --------------------------------------------------
// Upload Image / Video to Cloudinary
// --------------------------------------------------

export const uploadImageToFirebase = async (
  localUri: string,
  type: string,
  authPhone = ''
): Promise<string> => {
  if (!localUri) {
    throw new Error('Image URI missing.');
  }

  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error(
      'User login required. Firebase Auth currentUser is null.'
    );
  }

  try {
    console.log('Media upload started:', {
      type,
      uid: currentUser.uid,
      authPhone,
      localUri,
    });

    const mediaType =
      type === 'video'
        ? 'video'
        : 'image';

    const cloudinaryUrl = await uploadMediaToCloudinary(
      localUri,
      mediaType
    );

    if (!cloudinaryUrl) {
      throw new Error(
        'Cloudinary ne upload URL return nahi ki.'
      );
    }

    console.log('Media upload successful:', {
      type: mediaType,
      uid: currentUser.uid,
      url: cloudinaryUrl,
    });

    return cloudinaryUrl;

  } catch (error: any) {
    console.error(
      'Media upload failed:',
      {
        code: error?.code,
        message: error?.message,
        name: error?.name,
        error,
      }
    );

    throw error;
  }
};


// --------------------------------------------------
// Ensure URI is a Cloudinary / Web URL
// --------------------------------------------------

export const ensureCloudImageUri = async (
  uri: string | null,
  type: string,
  authPhone = ''
): Promise<string | null> => {

  if (!uri) {
    return null;
  }

  // Already uploaded URL
  if (/^https?:\/\//i.test(uri)) {
    return uri;
  }

  // Local Expo URI
  if (/^(file|content):\/\//i.test(uri)) {
    return await uploadImageToFirebase(
      uri,
      type,
      authPhone
    );
  }

  return uri;
};
'''

write_file("services/storage.ts", storage_ts)


# ============================================================
# 3. FIREBASE AUTH
# ============================================================
#
# IMPORTANT:
# Firebase 12.18.0's Node TypeScript resolution does not expose
# getReactNativePersistence from the default firebase/auth
# typings, even though the React Native runtime bundle contains
# it.
#
# Therefore we avoid the broken TS import here.
#
# The existing anonymous login flow remains:
#
#   signInAnonymously(auth)
#
# This fixes the "auth implicitly any" problem as well.
#
# For now getAuth(app) is retained intentionally so we do not
# destabilize the working V2 authentication flow.
#
# ============================================================

firebase_ts = r'''import { getApps, initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCSUFhcnN5zZgRjxNvylglQiMeNSVu0Zvs',
  authDomain: 'bookmyslot-1264c.firebaseapp.com',
  projectId: 'bookmyslot-1264c',
  storageBucket: 'bookmyslot-1264c.firebasestorage.app',
  messagingSenderId: '139153043703',
  appId: '1:139153043703:web:95935dfaf328eeef1fe3f2',
  measurementId: 'G-EGSJ3Q87D2',
};

// Firebase App — Singleton
const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Firebase Auth
//
// Keep getAuth(app) here because Firebase v12.18.0's default
// TypeScript entrypoint does not expose getReactNativePersistence,
// while Metro's React Native bundle does have RN-specific behavior.
//
// Most importantly, this keeps the existing anonymous-auth flow
// used by AppContext intact.
//
// Explicit Auth type prevents the previous:
//
//   Variable 'auth' implicitly has type 'any'
//
// TypeScript error.

export const auth: Auth = getAuth(app);

export default app;
'''

write_file("services/firebase.ts", firebase_ts)


# ============================================================
# 4. CLEAR EXPO CACHE
# ============================================================

print()
print("=" * 64)
print("V2 UPLOAD FIX COMPLETE")
print("=" * 64)
print()
print("Changed:")
print("  services/cloudinary.ts")
print("  services/storage.ts")
print("  services/firebase.ts")
print()
print("The Cloudinary upload no longer uses React Native FormData.")
print("It now uses Expo FileSystem multipart upload.")
print()
print("Next:")
print()
print("  npx tsc --noEmit")
print()
print("Then:")
print()
print("  npx expo start -c")
print()
print("Then test:")
print("  1. Login")
print("  2. Open image picker")
print("  3. Select image")
print("  4. Upload/save")
print()
print("DO NOT change Cloudinary preset/name.")
print("Cloud name     :", "mc6tawmp")
print("Upload preset  :", "service_app_feed")
print()
