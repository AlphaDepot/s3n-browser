'use client';
import FolderView from '@/components/s3/files/folder-view';
import ImageView from '@/components/s3/files/image-view';
import {useS3Navigation} from '@/hooks/s3';
import useS3ObjectOperations from '@/hooks/s3/use-s3-object-operations';
import {S3Object, S3ObjectType} from '@/lib/s3';

import {MouseEvent} from 'react';
import BrowserSkeletonList from '@/components/s3/directory/browser-skeleton-list';

/**
 * Component for browsing S3 objects in a directory structure.
 *
 * This component displays S3 objects as folders or files, allowing users to navigate
 * through directories and view object details.
 */
export default function S3Browser() {
  // Hook to manage S3 object navigation and loading state
  const { loading, s3Objects, updateS3Objects } = useS3Navigation();
  // Hook to manage selected S3 object and its details visibility
  const { setSelectedS3Object, setShowSelectedS3ObjectDetails } =
    useS3ObjectOperations();

  if (loading) {
    return <BrowserSkeletonList />;
  }
  /**
   * Handles navigation to a specified directory.
   *
   * @param {string} [key] - The key of the directory to navigate to.
   */
  const handleNavigation = async (key?: string) => {
    if (!key) {
      return;
    }

    await updateS3Objects(key);
  };
  /**
   * Handles the selection of an S3 object.
   *
   * @param {MouseEvent} e - The mouse event triggered by the selection.
   * @param {S3Object} file - The selected S3 object.
   */
  const handleObjectSelect = async (e: MouseEvent, file: S3Object) => {
    e.stopPropagation();
    if (!file.key) return;
    setSelectedS3Object(file);
    setShowSelectedS3ObjectDetails(true);
  };

  // Map over the list of S3 objects and render them as folders or files
  const directoryMap = s3Objects.map((dir: S3Object) => {
    const isFolder =
      dir.type === S3ObjectType.DIRECTORY || dir.key.endsWith('/');

    if (isFolder) {
      return (
        <div
          key={dir.key}
          onClick={(e) => handleObjectSelect(e, dir)}
          onDoubleClick={() => handleNavigation(dir.key)}
        >
          <FolderView s3Object={dir} />
        </div>
      );
    }
    return (
      <div key={dir.key} onClick={(e) => handleObjectSelect(e, dir)}>
        <ImageView file={dir} />
      </div>
    );
  });

  // Render the directory map
  return <div className='flex flex-wrap gap-4 p-4'>{directoryMap}</div>;
}
