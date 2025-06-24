'use client';
import {useS3ObjectOperations} from '@/hooks/s3/index';
import {urlSigningServiceExpiresIn} from '@/lib/configuration/config-provider';
import {OperationResult} from '@/lib/responses/operation-result';
import {getSignedUrlCommand} from '@/lib/s3';
import {keyToSigningServiceUrl} from '@/lib/url-utilities';

import {useCallback, useEffect, useState} from 'react';

/**
 * Custom hook to manage the selected S3 object and its associated URLs.
 *
 * This hook provides functionality to retrieve and manage:
 * - The selected S3 object.
 * - A signed URL for accessing the object.
 * - A signing service URL.
 * - A clean URL for the object.
 * - The default expiration time for signed URLs.
 *
 * @param {number} [expiresInSeconds] - Optional expiration time (in seconds) for the signed URL.
 */
export default function useS3ObjectDetails(expiresInSeconds?: number) {
  // Stores
  const { selectedS3Object, selectedS3ObjectCleanUrl } = useS3ObjectOperations();

  // States
  const [signedUrl, setSignedUrl] = useState<string | null | undefined>(null);
  const [signingServiceUrl, setSigningServiceUrl] = useState<string | null>(
    null
  );
  const [cleanUrl, setCleanUrl] = useState<string | null>(null);
  const [defaultExpiresInSeconds, setDefaultExpiresInSeconds] = useState<
    number | null
  >();

  /**
   * Fetches the signing service URL for the selected S3 object.
   *
   * @returns {Promise<OperationResult<boolean>>} The result of the operation.
   */
  const getSigningServiceUrl = useCallback(async () => {
    if (!selectedS3Object) {
      return OperationResult.Failure<boolean>('No selected S3 object');
    }

    const apiUrl = await keyToSigningServiceUrl(selectedS3Object.key);
    if (apiUrl) {
      setSigningServiceUrl(apiUrl);
      return OperationResult.Success(true);
    }

    return OperationResult.Failure<boolean>(
      'Failed to get signing service URL'
    );
  }, [selectedS3Object]);

  /**
   * Fetches a signed URL for the selected S3 object.
   *
   * @returns {Promise<OperationResult<boolean>>} The result of the operation.
   */
  const getSignedUrl = useCallback(async () => {
    if (!selectedS3Object) {
      return OperationResult.Failure<boolean>('No selected S3 object');
    }
    try {
      const signedUrlResult = await getSignedUrlCommand(
        selectedS3Object.key,
        expiresInSeconds
      );
      setSignedUrl(signedUrlResult?.data);
      return OperationResult.Success(true);
    } catch (error) {
      setSignedUrl(null);
      return OperationResult.Failure<boolean>(
        'Error fetching signed URL',
        error
      );
    }
  }, [selectedS3Object, expiresInSeconds]);

  // Effect to fetch signing service URL and signed URL
  useEffect(() => {
    const serviceUrl = async () => {
      await getSigningServiceUrl();

      // Get signed URL
      await getSignedUrl();

      // Set clean URL
      setCleanUrl(selectedS3ObjectCleanUrl);

      // Set default expiration time
      setDefaultExpiresInSeconds(await urlSigningServiceExpiresIn());
    };

    serviceUrl().finally();
  }, [
    expiresInSeconds,
    getSignedUrl,
    getSigningServiceUrl,
    selectedS3Object,
    selectedS3ObjectCleanUrl,
  ]);

  return {
    selectedS3Object,
    selectedItemCleanUrl: selectedS3ObjectCleanUrl,
    signingServiceUrl,
    signedUrl,
    cleanUrl,
    defaultExpiresInSeconds,
  };
}
