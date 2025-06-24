'use client';
import {getObjectsAction} from '@/actions/s3-actions';
import {useAppStore} from '@/context/app-store-provider';
import {usePersistedAppStore} from '@/context/persisted-app-store-provider';
import logger from '@/lib/logging/logger';

import {OperationResult} from '@/lib/responses/operation-result';
import {S3Object} from '@/lib/s3';
import {useCallback, useEffect, useState} from 'react';
import {useShallow} from 'zustand/react/shallow';

/**
 * Custom hook to manage S3 object navigation.
 *
 * This hook provides functionality to:
 * - Retrieve S3 objects from a specified path.
 * - Manage the current path in the S3 bucket.
 * - Update and refresh the list of S3 objects.
 */
export default function useS3Navigation() {
  // Store
  const { s3Objects, setS3Objects } = useAppStore(
    useShallow((state) => ({
      s3Objects: state.s3Objects,
      setS3Objects: state.setS3Objects,
    }))
  );

  const { getPath, setPath, currentPath } = usePersistedAppStore(
    useShallow((state) => ({
      currentPath: state.path,
      getPath: state.getPath,
      setPath: state.setPath,
    }))
  );

  const [loading, setLoading] = useState<boolean>(true);
    const [isRoot, setIsRoot] = useState(false);

  /**
   * Fetches S3 objects for a given path.
   *
   * @param {string} [key=''] - The path in the S3 bucket to fetch objects from.
   * @returns {Promise<OperationResult<boolean>>} The result of the operation.
   */
  const getS3Objects = useCallback(
    async (key: string = '', refresh = false) => {
      const response = await getObjectsAction(key, undefined, refresh);
      if (!response.success || !response.data) {
        return OperationResult.ConvertFailure<S3Object[], boolean>(response);
      }

      setS3Objects(response.data);
      setPath(key);
      return OperationResult.Success(true);
    },
    [setS3Objects, setPath]
  );

  /**
   * Loads S3 objects for the current path when the component mounts.
   */
  useEffect(() => {
    const loadS3Objects = async () => {
      setLoading(true);
      await getS3Objects(getPath());
    };

    loadS3Objects()
      .catch((err) => {
        logger.error(err);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [getS3Objects, getPath, setS3Objects]);

    /**
     * Checks if the current path is the root directory and updates the state accordingly.
     */
    useEffect(() => {
        const currentLocation = getPath();

        // Check if the current location is root
        if (currentLocation === '/' || currentLocation === '') {
            setIsRoot(true);
        } else {
            setIsRoot(false);
        }
    }, [getPath, currentPath]);

  /**
   * Updates the list of S3 objects for a given path.
   *
   * @param {string} [key=''] - The path in the S3 bucket to update objects for.
   */ const updateS3Objects = useCallback(
    async (key: string = '') => {
      setLoading(true);

      setPath(key);
      await getS3Objects(key, true).finally(() => setLoading(false));
    },
    [getS3Objects, setPath]
  );
  /**
   * Refreshes the S3 objects in the current path.
   */
  const refreshCurrentPath = async () => {
    const currentPath = getPath();
    if (!currentPath) {
      return;
    }
    setLoading(true);
    await getS3Objects(currentPath).finally(() => setLoading(false));
  };

    /**
     * Navigate to the parent directory of the current S3 path.
     *
     * If the current path is the root directory, no action is taken.
     * Otherwise, the parent directory is determined and navigated to.
     */
    const toParentDirectory = async () => {
        const currentLocation = getPath();

        // Handle root directory case
        if (currentLocation === '/' || currentLocation === '') {
            return; // Already at root
        }

        // Remove trailing slash if present
        const trimmedPath = currentLocation.endsWith('/')
            ? currentLocation.slice(0, -1)
            : currentLocation;

        // Find the last slash position
        const lastSlashIndex = trimmedPath.lastIndexOf('/');

        /// If no slash found or only root slash, go to root
        if (lastSlashIndex <= 0) {
            await getS3Objects('');
            setPath('');
            return;
        }

        // Get the parent directory with trailing slash
        const parentLocation = trimmedPath.substring(0, lastSlashIndex) + '/';
        await getS3Objects(parentLocation);
    };

  return {
    loading,
    s3Objects,
    currentPath,
    getS3Objects,
    setPath,
    getPath,
    updateS3Objects,
    refreshCurrentPath,
      toParentDirectory,
      isRoot,
  };
}
