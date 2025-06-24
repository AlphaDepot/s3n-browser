'use server';
import {
  s3FileUploadLimit,
  s3SignedUrlExpires,
  signingServiceUrl,
} from '@/lib/configuration/environment-variables';

/**
 * Provides the signing service URL if it is configured.
 *
 * @returns {Promise<string | null>} The signing service URL, or `null` if not configured.
 */
export default async function configProvider() {
  if (!signingServiceUrl) {
    return null;
  }

  return signingServiceUrl;
}

/**
 * Retrieves the expiration time for the URL signing service.
 *
 * @returns {Promise<number | null>} The expiration time in seconds, or `null` if not configured.
 */
export async function urlSigningServiceExpiresIn() {
  if (!s3SignedUrlExpires) {
    return null;
  }

  return s3SignedUrlExpires;
}

/**
 * Retrieves the upload size limit for S3 in bytes.
 *
 * @returns {Promise<number | null>} The upload size limit in bytes, or `null` if not configured or invalid.
 */
export async function s3UploadLimit(): Promise<number | null> {
  if (!s3FileUploadLimit) {
    return null;
  }

  const limit = parseInt(s3FileUploadLimit, 10);
  if (isNaN(limit)) {
    return null;
  }

  return limit;
}
