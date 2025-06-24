import { OperationResult } from '@/lib/responses/operation-result';

/**
 * Standard error responses for S3 operations.
 */
export const S3Responses = {
  /**
   * Error response indicating that a file with the same name already exists.
   *
   * @type {OperationResult.Failure<string>}
   * @property {string} message - The error message for the operation.
   * @property {Error} error - The underlying error object.
   */
  FileNameExists: OperationResult.Failure<string>(
    'Object already exists. Please choose a different name.',
    new Error('Object already exists. Please choose a different name.')
  ),

  /**
   * Error response indicating that the file upload to S3 failed.
   *
   * @type {OperationResult.Failure<string>}
   * @property {string} message - The error message for the operation.
   * @property {Error} error - The underlying error object.
   */
  UploadFailed: OperationResult.Failure<string>(
    'Failed to upload file to S3',
    new Error('S3 upload operation failed')
  ),

  /**
   * Error response indicating that an invalid S3 object key was provided.
   *
   * @type {OperationResult.Failure<string>}
   * @property {string} message - The error message for the operation.
   * @property {Error} error - The underlying error object.
   */
  InvalidKey: OperationResult.Failure<string>(
    'Invalid S3 object key provided',
    new Error('Invalid or empty S3 key')
  ),

  /**
   * Error response indicating that the destination key already exists, aborting the copy operation.
   *
   * @type {OperationResult.Failure<boolean>}
   * @property {string} message - The error message for the operation.
   * @property {Error} error - The underlying error object.
   */
  DestinationKeyExist: OperationResult.Failure<boolean>(
    'Destination key already exists, copy operation aborted',
    new Error('Destination key already exists, copy operation aborted')
  ),
};
