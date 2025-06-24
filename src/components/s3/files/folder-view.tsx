'use client';
import FileViewContainer from '@/components/s3/files/file-view-container';
import { S3Object } from '@/lib/s3';
import { Folder } from 'lucide-react';

interface FolderViewProps {
  s3Object: S3Object;
}
/**
 * Component for rendering a folder view in the S3 browser.
 *
 * This component displays a folder icon along with the folder's name and key.
 * It uses the `FileViewContainer` component to provide a consistent layout.
 *
 * @param {FolderViewProps} props - The properties for the folder view component.
 */
export default function FolderView({ s3Object }: FolderViewProps) {
  return (
    <FileViewContainer
      view={<Folder size={64} />}
      title={s3Object.name}
      s3ObjectKey={s3Object.key}
    />
  );
}
