'use client';

import {useS3Navigation} from '@/hooks/s3';

/**
 * Component for displaying the current directory breadcrumb in an S3 browser.
 *
 * This component shows the current path in the S3 object navigation, allowing users
 * to see their location within the directory structure.
 */
export default function DirectoryBreadcrumb() {
  const { currentPath } = useS3Navigation();

  return <div>/{currentPath.toString()}</div>;
}
