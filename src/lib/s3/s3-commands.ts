'use server';
import { s3BucketName } from '@/lib/configuration/environment-variables';
import { S3Responses } from '@/lib/responses/s3-responses';

import s3ServiceClient from '@/lib/s3/s3-client';
import {
  checkIfObjectKeyExists,
  listAllS3ObjectsInDirectory,
} from '@/lib/s3/s3-queries';

import {
  _Object,
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

import { OperationResult } from '../responses/operation-result';

const BucketName = s3BucketName;
const client = s3ServiceClient;

/**
 * Copies an object in S3 from one key to another.
 * @param sourceKey
 * @param destinationKey
 */
export async function copyS3ObjectCommand(
  sourceKey: string,
  destinationKey: string
): Promise<OperationResult<boolean>> {
  const command = new CopyObjectCommand({
    Bucket: BucketName,
    CopySource: `${BucketName}/${sourceKey}`, // Copy source must include bucket name, this is an AWS requirement
    Key: destinationKey,
  });

  try {
    // check if the destination key already exists
    const existOperationResult = await checkIfObjectKeyExists(destinationKey);
    if (existOperationResult.success && existOperationResult.data) {
      return S3Responses.DestinationKeyExist;
    }

    // execute the copy command
    await client.send(command);

    return OperationResult.Success(true);
  } catch (error) {
    return OperationResult.Failure('Error copying S3 object', error);
  }
}

/**
 *  Copies an entire directory in S3 from one prefix to another.
 */
export async function copyS3DirectoryCommand(
  sourceKey: string,
  destinationKey: string
): Promise<OperationResult<boolean>> {
  try {
    // list all objects in the source directory
    const listOperationResult = await listAllS3ObjectsInDirectory(sourceKey);
    if (!listOperationResult.success || !listOperationResult.data) {
      return OperationResult.ConvertFailure(listOperationResult);
    }

    const existOperationResult = await checkIfDestinationDirectoryExist(
      listOperationResult.data,
      destinationKey
    );

    if (existOperationResult.data) {
      return S3Responses.DestinationKeyExist;
    }

    for (const object of listOperationResult.data) {
      const objectKey = object.Key || '';

      const destinationObjectKey = transformS3DirectoryKeys(
        objectKey,
        destinationKey
      );

      // Copy each object to the new destination
      const response = await copyS3ObjectCommand(
        objectKey,
        destinationObjectKey
      );

      if (!response) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error('Copy operation failed or returned no response');
      }
    }
    return OperationResult.Success(true); // return true if all objects were copied successfully
  } catch (error) {
    return OperationResult.Failure('Error copying S3 directory', error);
  }
}

/**
 * Moves an object in S3 from one key to another.
 * @param sourceKey
 * @param destinationKey
 */
export async function moveS3ObjectCommand(
  sourceKey: string,
  destinationKey: string
): Promise<OperationResult<boolean>> {
  try {
    const copyResponse = await copyS3ObjectCommand(sourceKey, destinationKey);
    if (!copyResponse.success) {
      return copyResponse;
    }

    const deleteResponse = await deleteS3ObjectCommand(sourceKey);
    if (!deleteResponse.success) {
      return deleteResponse;
    }

    return OperationResult.Success(true);
  } catch (error) {
    return OperationResult.Failure('Error copy S3 object', error);
  }
}

/**
 *   Moves an entire directory in S3 from one prefix to another.
 * @param sourceKey
 * @param destinationKey
 */
export async function moveS3DirectoryCommand(
  sourceKey: string,
  destinationKey: string
): Promise<OperationResult<boolean>> {
  try {
    const copyResponse = await copyS3DirectoryCommand(
      sourceKey,
      destinationKey
    );

    if (!copyResponse.success) {
      return copyResponse;
    }

    const deleteResponse = await deleteS3DirectoryCommand(sourceKey);
    if (!deleteResponse.success) {
      return deleteResponse;
    }

    return OperationResult.Success(true);
  } catch (error) {
    return OperationResult.Failure('Error moving S3 directory', error);
  }
}

/**
 * Deletes an object in S3.
 * @param key
 */
export async function deleteS3ObjectCommand(
  key: string
): Promise<OperationResult<boolean>> {
  const command = new DeleteObjectCommand({
    Bucket: BucketName,
    Key: key,
  });

  try {
    await client.send(command);
    return OperationResult.Success(true);
  } catch (error) {
    return OperationResult.Failure('Error deleting S3 object', error);
  }
}

/**
 *  Deletes an entire directory in S3 from one prefix to another.
 */
export async function deleteS3DirectoryCommand(
  key: string
): Promise<OperationResult<boolean>> {
  try {
    // list all objects in the source directory
    const listOperationResult = await listAllS3ObjectsInDirectory(key);
    if (!listOperationResult.success || !listOperationResult.data) {
      return OperationResult.ConvertFailure(listOperationResult);
    }

    for (const object of listOperationResult.data) {
      const objectKey = object.Key || '';

      // Delete each object in the directory
      const response = await deleteS3ObjectCommand(objectKey);
      if (!response) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error('Delete operation failed or returned no response');
      }
    }
    return OperationResult.Success(true); // return true if all objects were deleted successfully
  } catch (error) {
    return OperationResult.Failure('Error deleting S3 directory', error);
  }
}

/**
 *  Renames an S3 object by moving it to a new key.
 * @param key
 * @param destinationKey
 */
export async function renameS3ObjectCommand(
  key: string,
  destinationKey: string
) {
  return moveS3ObjectCommand(key, destinationKey);
}

/**
 *  Renames an S3 directory by moving it to a new key.
 * @param key
 * @param newLocationName
 */
export async function renameS3DirectoryCommand(
  key: string,
  newLocationName: string
) {
  return moveS3DirectoryCommand(key, newLocationName);
}

/**
 *  Creates a new S3 object (folder) with the given key.
 * @param key
 */
export async function createS3FolderCommand(
  key: string
): Promise<OperationResult<boolean>> {
  // Make sure the key ends with a trailing slash for directories
  if (!key.endsWith('/')) {
    key = `${key}/`;
  }

  const command = new PutObjectCommand({
    Bucket: BucketName,
    Key: key,
    ContentLength: 0, // Set content length to 0 for empty folders
  });

  try {
    await client.send(command);
    return OperationResult.Success(true);
  } catch (error) {
    return OperationResult.Failure('Error creating S3 object', error);
  }
}

/**
 *  Checks if any objects in the destination directory already exist.
 * @param objects

 * @param destinationKey
 */
async function checkIfDestinationDirectoryExist(
  objects: _Object[],
  destinationKey: string
): Promise<OperationResult<boolean>> {
  // Early return optimization for empty arrays
  if (objects.length === 0) {
    return OperationResult.Success(false);
  }

  // Check objects in parallel until we find one that exists
  for (const object of objects) {
    const objectKey = object.Key || '';

    const destinationObjectKey = transformS3DirectoryKeys(
      objectKey,
      destinationKey
    );

    // Check if any existing objects are found
    const existOperationResult =
      await checkIfObjectKeyExists(destinationObjectKey);
    if (existOperationResult.success && existOperationResult.data) {
      return OperationResult.Success(true); // Object already exists
    }
  }

  return OperationResult.Success(false); // No existing objects found
}

/**
 * Transforms S3 directory keys for copying/moving.
 * For example, if the source key is "source/dir/" and the destination key is "dest/dir/",
 *  it will replace the source prefix with the destination prefix.
 * @param currentObjectKey
 * @param destinationKey
 */
function transformS3DirectoryKeys(
  currentObjectKey: string,
  destinationKey: string
): string {
  // Normalize source and destination keys for consistent comparison
  const normalizedDestKey = destinationKey.endsWith('/')
    ? destinationKey
    : destinationKey + '/';

  // Extract the relative path from the source object
  const sourcePrefix = currentObjectKey.split('/')[0] + '/';

  // Create the new destination path by replacing the source prefix
  return currentObjectKey.replace(sourcePrefix, normalizedDestKey);
}
