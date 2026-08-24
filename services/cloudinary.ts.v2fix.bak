import * as FileSystem from 'expo-file-system/legacy';

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
  });

  try {
    const fileInfo = await FileSystem.getInfoAsync(localUri);

    console.log('Cloudinary file check:', {
      exists: fileInfo.exists,
      uri: localUri,
    });

    if (!fileInfo.exists) {
      throw new Error(`Local media file does not exist: ${localUri}`);
    }

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

    console.log('Cloudinary response:', {
      status: result.status,
      body: result.body?.slice?.(0, 500),
    });

    if (result.status < 200 || result.status >= 300) {
      throw new Error(
        `Cloudinary upload failed (${result.status}): ${result.body}`
      );
    }

    const data = JSON.parse(result.body);

    const cloudinaryUrl = data?.secure_url || data?.url;

    if (!cloudinaryUrl) {
      throw new Error(
        `Cloudinary upload succeeded but no URL was returned: ${result.body}`
      );
    }

    console.log('Cloudinary upload successful:', cloudinaryUrl);

    return cloudinaryUrl;
  } catch (error: any) {
    console.error('Cloudinary upload error:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
    });

    throw error;
  }
};