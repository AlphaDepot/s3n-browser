'use client';
import logger from '@/lib/logging/logger';
import {getSignedUrlCommand, S3Object} from '@/lib/s3';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';

/**
 * Custom hook to fetch a signed URL for an S3 object.
 *
 * This hook provides functionality to:
 * - Retrieve a signed URL for accessing an S3 object.
 * - Extract a clean URL (without query parameters) from the signed URL.
 * - Handle errors during the signed URL retrieval process.
 */
export default function useS3SignedUrl(file: S3Object) {
  const [signedUrl, setSignedUrl] = useState<string | null | undefined>(null);
  const [cleanUrl, setCleanUrl] = useState<string | null | undefined>(null);

  useEffect(() => {
    /**
     * Fetches the signed URL for the given S3 object.
     *
     * This function retrieves the signed URL using the `getSignedUrlCommand` function
     * and extracts the clean URL by removing query parameters.
     */
    const fetchSignedUrl = async () => {
      try {
        const signedUrlResult = await getSignedUrlCommand(file.key);

        setSignedUrl(signedUrlResult?.data);
        // Extract the clean URL by removing the query parameters
        const cleanUrl = signedUrlResult?.data?.split('?')[0];
        setCleanUrl(cleanUrl);
      } catch (error) {
        logger.error(error);
        toast.error('Error fetching signed URL');
      }
    };

    fetchSignedUrl().catch(console.error);

    return () => {
      setSignedUrl(null);
      setCleanUrl(null);
    };
  }, [file.key]);

  return { signedUrl, cleanUrl };
}
