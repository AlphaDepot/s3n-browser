/**
 * The S3 Access Key ID used for authentication with the S3 service.
 * Retrieved from the `S3_ACCESS_KEY_ID` environment variable.
 */
const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID;

/**
 * The S3 Secret Access Key used for authentication with the S3 service.
 * Retrieved from the `S3_SECRET_ACCESS_KEY` environment variable.
 */
const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

/**
 * The name of the S3 bucket.
 * Retrieved from the `S3_BUCKET_NAME` environment variable.
 */
const s3BucketName = process.env.S3_BUCKET_NAME;

/**
 * The custom endpoint URL for the S3 service.
 * Retrieved from the `S3_ENDPOINT_URL` environment variable.
 */
const s3EndpointUrl = process.env.S3_ENDPOINT_URL;

/**
 * The AWS region where the S3 bucket is located.
 * Defaults to `us-east-1` if not specified in the `S3_REGION` environment variable.
 */
const s3Region = process.env.S3_REGION || 'us-east-1';

/**
 * Whether to force path-style addressing for S3 requests.
 * Defaults to `true` unless explicitly set to `false` in the `S3_FORCE_PATH_STYLE` environment variable.
 */
const s3ForcePathStyle: boolean =
  process.env.S3_FORCE_PATH_STYLE === 'false' || true;

/**
 * The upload size limit for files in bytes.
 * Retrieved from the `S3_FILE_UPLOAD_LIMIT` environment variable.
 */
const s3FileUploadLimit = process.env.S3_FILE_UPLOAD_LIMIT;

/**
 * The number of seconds a signed URL is valid for.
 * Defaults to 900 seconds (15 minutes) if not specified in the `S3_SIGNED_URL_EXPIRES` environment variable.
 */
const s3SignedUrlExpires = process.env.S3_SIGNED_URL_EXPIRES
  ? parseInt(process.env.S3_SIGNED_URL_EXPIRES, 10)
  : 900;

/**
 * The URL of the service that handles S3 object signing.
 * Retrieved from the `SIGNING_SERVICE_URL` environment variable.
 */
const signingServiceUrl = process.env.SIGNING_SERVICE_URL;

/**
 * Validates the required environment variables for S3 configuration.
 *
 * Checks for the presence of `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, and `S3_BUCKET_NAME`.
 * If any of these variables are missing, an error is thrown with a list of missing variables.
 *
 * @throws {Error} If any required environment variables are missing.
 */
export function validateEnvironmentVariables() {
  let hasErrors: boolean = false;
  const errors: Error[] = [];

  if (!s3AccessKeyId) {
    errors.push(new Error('Missing S3 Access Key ID'));
    hasErrors = true;
  }
  if (!s3SecretAccessKey) {
    errors.push(new Error('Missing S3 Secret Access Key'));
    hasErrors = true;
  }
  if (!s3BucketName) {
    errors.push(new Error('Missing S3 Bucket Name'));
    hasErrors = true;
  }

  if (hasErrors) {
    throw new Error(errors.map((e) => e.message).join('\n'));
  }
}

export {
  s3AccessKeyId,
  s3SecretAccessKey,
  s3BucketName,
  s3EndpointUrl,
  s3Region,
  s3ForcePathStyle,
  s3SignedUrlExpires,
  signingServiceUrl,
  s3FileUploadLimit,
};
