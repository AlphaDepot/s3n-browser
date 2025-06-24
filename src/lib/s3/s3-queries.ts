'use server';
import {
  s3BucketName,
  s3SignedUrlExpires,
} from '@/lib/configuration/environment-variables';

import { OperationResult } from '@/lib/responses/operation-result';
import { S3Responses } from '@/lib/responses/s3-responses';
import s3ServiceClient from '@/lib/s3/s3-client';

import {
  _Object,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ListObjectsV2CommandOutputToS3Object } from '@/lib/s3/s3-helpers';
import { S3Object } from '@/lib/s3/s3-types';

const BucketName = s3BucketName;
const client = s3ServiceClient;

/**
 * Fetches a list of objects in an S3 bucket with a given prefix.
 * @param key - The prefix to filter the objects by. Default is an empty string.
 * @param delimiter
 * @constructor
 */
export async function getObjectsByKeyCommand(
  key?: string,
  delimiter: string = '/'
): Promise<OperationResult<S3Object[]>> {
  key = key || '';
  const command = new ListObjectsV2Command({
    Bucket: BucketName,
    Prefix: key,
    Delimiter: delimiter,
  });

  try {
    const response = await client.send(command);
    if (!response) {
      return OperationResult.Failure<S3Object[]>(
        'Response is null or undefined when fetching S3 objects'
      );
    }

    const objects = ListObjectsV2CommandOutputToS3Object(response);

    return OperationResult.Success<S3Object[]>(objects);
  } catch (error) {
    return OperationResult.Failure<S3Object[]>(
      'Error fetching S3 objects',
      error
    );
  }
}

/**
 * Checks if an object exists in the S3 bucket.
 * @param key
 */
export async function checkIfObjectKeyExists(
  key: string
): Promise<OperationResult<boolean>> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BucketName,
      Key: key,
    });
    await client.send(command);
    return OperationResult.Success(true); // Object exists
  } catch (error) {
    if (error instanceof S3ServiceException && error.name === 'NotFound') {
      return OperationResult.Success(false); // Object doesn't exist return false
    }
    return OperationResult.Failure('Error checking if S3 object exists', error);
  }
}

/**
 *  Generates a presigned URL for uploading an object to S3.
 * @param key - The S3 object key (location) where the file will be uploaded.
 * @param overwrite - If true, it will override the existing object if it exists.
 * @param contentType - The content type of the file being uploaded.
 */
export async function generateUploadPresignedUrl(
  key?: string,
  overwrite: boolean = false,
  contentType: string = 'application/octet-stream'
): Promise<OperationResult<string>> {
  if (!key || key.trim() === '') {
    key = key || '/';
  }

  const command = new PutObjectCommand({
    Bucket: BucketName,
    Key: key,
    ContentType: contentType,
  });

  try {
    // check if object exists
    const exists = await checkIfObjectKeyExists(key);
    if (exists.success && exists.data && !overwrite) {
      return S3Responses.FileNameExists;
    }

    // Generate the presigned URL
    const url = await getSignedUrl(client, command, {
      expiresIn: s3SignedUrlExpires,
    });
    return OperationResult.Success<string>(url);
  } catch (error) {
    return OperationResult.Failure<string>(
      'Error generating presigned URL',
      error
    );
  }
}

/**
 * Fetches a list of all objects in an S3 bucket with a given prefix. Resource Intensive. NOT in Use.
 * @param prefix - The prefix to filter the objects by. Default is an empty string.
 * @constructor
 */
export async function listAllObjects(
  prefix: string = ''
): Promise<OperationResult<string[]>> {
  let continuationToken: string | undefined = undefined;
  const allKeys: string[] = [];

  do {
    const command: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: BucketName,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });

    try {
      const response = await client.send(command);

      // Collect keys from the current response
      const keys = response.Contents?.map((item) => item.Key || '') || [];
      allKeys.push(...keys);

      // Update the continuation token for the next request
      continuationToken = response.NextContinuationToken;
    } catch (error) {
      return OperationResult.Failure<string[]>(
        'Error fetching list of S3 objects',
        error
      );
    }
  } while (continuationToken);

  return OperationResult.Success<string[]>(allKeys);
}

/**
 * Fetches a list of objects in an S3 bucket with a given prefix.
 * @param rootKey
 */
export async function listAllS3ObjectsInDirectory(
  rootKey: string
): Promise<OperationResult<_Object[]>> {
  // Normalize the rootKey to ensure proper prefix format
  let prefix = rootKey;
  if (prefix === '/') {
    prefix = ''; // Empty prefix to list all objects at root
  } else if (prefix.startsWith('/')) {
    prefix = prefix.substring(1); // Remove leading slash for S3 paths
  }

  // Ensure directory paths end with '/'
  if (prefix !== '' && !prefix.endsWith('/')) {
    prefix += '/';
  }

  const command = new ListObjectsV2Command({
    Bucket: BucketName,
    Prefix: prefix,
  });

  try {
    const response = await client.send(command);
    return OperationResult.Success<_Object[]>(
      (response.Contents as _Object[]) || []
    );
  } catch (error) {
    return OperationResult.Failure<_Object[]>(
      'Error fetching S3 objects',
      error
    );
  }
}

/**
 * Cache for signed URLs to avoid generating them multiple times.
 * This cache stores the URL and its expiration timestamp.
 */
const signedUrlCache = new Map<
  string,
  {
    url: string;
    expiresAt: number; // timestamp in ms
  }
>();

/**
 * Generates a signed URL for an S3 object.
 * @param key - The S3 object key.
 * @param expiresInSecond - The expiration time in seconds. Default to s3SignedUrlExpires.
 * @constructor
 */
export async function getSignedUrlCommand(
  key: string,
  expiresInSecond?: number
): Promise<OperationResult<string>> {
  const expiresIn = expiresInSecond ?? s3SignedUrlExpires;
  // Check cache first
  const now = Date.now();
  const cached = signedUrlCache.get(key);

  // Return cached URL if it exists and isn't expired (with 10s buffer)
  if (cached && cached.expiresAt > now + expiresIn) {
    return OperationResult.Success<string>(cached.url);
  }

  const command = new GetObjectCommand({
    Bucket: BucketName,
    Key: key,
  });
  try {
    const url = await getSignedUrl(client, command, { expiresIn });

    // Cache the signed URL with its expiration timestamp
    signedUrlCache.set(key, {
      url,
      expiresAt: now + expiresIn * 1000, // Convert seconds to ms
    });
    return OperationResult.Success<string>(url);
  } catch (error) {
    return OperationResult.Failure('Error generating signed URL', error);
  }
}
