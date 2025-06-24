import {
  s3AccessKeyId,
  s3EndpointUrl,
  s3ForcePathStyle,
  s3Region,
  s3SecretAccessKey,
} from '@/lib/configuration/environment-variables';
import { S3Client } from '@aws-sdk/client-s3';
import { S3ClientConfig } from '@aws-sdk/client-s3/dist-types/S3Client';

/**
 * Configuration object for the S3 client.
 *
 * This configuration includes the AWS region, credentials, and optional settings
 * such as forcing path-style addressing and specifying a custom endpoint URL.
 *
 * Note: `s3AccessKeyId` and `s3SecretAccessKey` are validated by the `validateS3EnvConfiguration`
 * function in `layout.tsx`.
 */
const s3Config: S3ClientConfig = {
  /** The AWS region where the S3 bucket is located. */
  region: s3Region,
  /** The credentials used to authenticate with the S3 service. */
  credentials: {
    /** The access key ID for the S3 service. */
    accessKeyId: s3AccessKeyId!,
    /** The secret access key for the S3 service. */
    secretAccessKey: s3SecretAccessKey!,
  },
  /** Whether to force path-style addressing for S3 requests. */
  forcePathStyle: s3ForcePathStyle,
};

/** If a custom S3 endpoint URL is provided, add it to the configuration. */
if (s3EndpointUrl) {
  s3Config.endpoint = s3EndpointUrl;
}

/**
 * An instance of the AWS S3 client configured with the specified settings.
 *
 * This client is used to interact with the S3 service, such as uploading, downloading,
 * and managing objects in S3 buckets.
 */
const s3ServiceClient = new S3Client(s3Config);

export default s3ServiceClient;
