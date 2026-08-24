import { uploadMediaToCloudinary } from '@/services/cloudinary';
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
