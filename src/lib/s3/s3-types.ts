import { _Object } from '@aws-sdk/client-s3';

/**
 * Type representing an S3 object.
 */
export type S3Object = {
  /**
   * The type of the S3 object (e.g., file or directory).
   */
  type: S3ObjectType;
  /**
   * The name of the S3 object.
   */
  name: string;
  /**
   * The key of the S3 object, used as a unique identifier in the bucket.
   */
  key: string;
  /**
   * Optional metadata or details about the S3 object.
   */
  object?: _Object | undefined;
};

/**
 * Enum representing the types of S3 objects.
 */
export enum S3ObjectType {
  /**
   * Represents a file in the S3 bucket.
   */
  FILE = 'file',
  /**
   * Represents a directory (folder) in the S3 bucket.
   */
  DIRECTORY = 'folder',
}
