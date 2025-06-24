import {OperationResult} from '@/lib/responses/operation-result';
import {
    copyS3DirectoryCommand,
    copyS3ObjectCommand,
    createS3FolderCommand,
    deleteS3DirectoryCommand,
    deleteS3ObjectCommand,
    generateUploadPresignedUrl,
    getObjectsByKeyCommand,
    getSignedUrlCommand,
    moveS3DirectoryCommand,
    moveS3ObjectCommand,
    renameS3DirectoryCommand,
    renameS3ObjectCommand,
    S3Object,
} from '@/lib/s3';

/**
 * Cache for S3 objects to avoid redundant API calls.
 * Workaround for issues with the useS3Navigation over-rendering
 */
const s3ObjectCache = new Map<string, Promise<OperationResult<S3Object[]>>>();

/**
 *  Fetches a list of objects in an S3 bucket with a given prefix.
 * @param key - The prefix to filter the objects by. Default is an empty string.
 * @param delimiter - The delimiter to use for grouping objects. Default is '/'.
 * @param forceRefresh - Whether to force a refresh of the cached objects. Default is false.
 */
export async function getObjectsAction(
  key?: string,
  delimiter?: string,
  forceRefresh: boolean = false
) {
  // Temporary workaround to overcome the issue with rendering
  if (s3ObjectCache.has(key || '') && !forceRefresh) {
    return s3ObjectCache.get(key || '') as Promise<OperationResult<S3Object[]>>;
  }

  const result = await getObjectsByKeyCommand(key, delimiter);

  s3ObjectCache.set(key || '', Promise.resolve(result));
  return result;
}

/**
 * Generates a presigned URL for uploading an object to S3.
 * @param key - The key for the object to be uploaded. Default is an empty string.
 * @param overwrite - Whether to overwrite the existing object. Default is false.
 */
export async function getUploadPresignedUrlAction(
  key?: string,
  overwrite?: boolean
) {
  return await generateUploadPresignedUrl(key, overwrite);
}

/**
 * Creates an object in S3 with the given key.
 * @param key
 */
export async function createS3FolderAction(
  key: string
): Promise<OperationResult<boolean>> {
  return await createS3FolderCommand(key);
}

/**
 * Moves an object from one key to another in S3.
 * @param sourceKey
 * @param destinationKey
 */
export async function moveS3ObjectAction(
  sourceKey: string,
  destinationKey: string
): Promise<OperationResult<boolean>> {
  return await moveS3ObjectCommand(sourceKey, destinationKey);
}

/**
 * Copies an object from one key to another in S3.
 * @param sourceKey
 * @param destinationKey
 */
export async function copyS3ObjectAction(
  sourceKey: string,
  destinationKey: string
): Promise<OperationResult<boolean>> {
  return await copyS3ObjectCommand(sourceKey, destinationKey);
}

/**
 * Copies a directory from one key to another in S3.
 * @param sourceKey
 * @param destinationKey
 */
export async function copyS3DirectoryAction(
  sourceKey: string,
  destinationKey: string
): Promise<OperationResult<boolean>> {
  return await copyS3DirectoryCommand(sourceKey, destinationKey);
}

/**
 * Moves a directory from one key to another in S3.
 * @param sourceKey
 * @param destinationKey
 */
export async function moveS3DirectoryAction(
  sourceKey: string,
  destinationKey: string
): Promise<OperationResult<boolean>> {
  return await moveS3DirectoryCommand(sourceKey, destinationKey);
}

/**
 * Renames an object in S3.
 * @param key
 * @param newName
 */
export async function renameS3ObjectAction(
  key: string,
  newName: string
): Promise<OperationResult<boolean>> {
  return await renameS3ObjectCommand(key, newName);
}

/**
 * Renames a directory in S3.
 * @param key
 * @param newLocationName
 */
export async function renameS3DirectoryAction(
  key: string,
  newLocationName: string
): Promise<OperationResult<boolean>> {
  return await renameS3DirectoryCommand(key, newLocationName);
}

/**
 * Deletes an object from S3.
 * @param key
 */
export async function deleteS3ObjectAction(
  key: string
): Promise<OperationResult<boolean>> {
  return await deleteS3ObjectCommand(key);
}

/**
 * Deletes a directory from S3.
 * @param key
 */
export async function deleteS3DirectoryAction(
  key: string
): Promise<OperationResult<boolean>> {
  return await deleteS3DirectoryCommand(key);
}

/**
 * Fetches a signed URL for an S3 object.
 * @param key
 * @param expiresInSeconds
 */
export async function getSignedUrlAction(
  key: string,
  expiresInSeconds?: number
): Promise<OperationResult<string | null>> {
  try {
    const signedUrlResult = await getSignedUrlCommand(key, expiresInSeconds);
    return OperationResult.Success(signedUrlResult?.data);
  } catch (error) {
    return OperationResult.Failure<string | null>(
      'Error fetching signed URL',
      error
    );
  }
}
