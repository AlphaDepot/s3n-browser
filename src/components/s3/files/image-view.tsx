'use client';

import FileTypesView from '@/components/s3/files/file-types-view';
import FileViewContainer from '@/components/s3/files/file-view-container';
import {useS3SignedUrl} from '@/hooks/s3';

import {S3Object} from '@/lib/s3';
import Image from 'next/image';
import {JSX} from 'react';
import FileSkeleton from '@/components/s3/files/file-skeleton';

interface ImageViewProps {
  file: S3Object;
}
/**
 * List of supported image file extensions.
 */
export const IMAGE_TYPES = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'svg',
  'webp',
  'bmp',
  'tiff',
  'avif',
];
/**
 * Component for rendering an image or file type view based on the file type.
 *
 * This component checks if the file is an image based on its extension.
 * If it is an image, it displays the image using a signed URL.
 * Otherwise, it falls back to rendering a file type view.
 *
 * @param {ImageViewProps} props - The properties for the component.
 */
export default function ImageView({ file }: ImageViewProps) {
  const { signedUrl: url } = useS3SignedUrl(file);

  /**
   * Renders the image view with a container.
   *
   * @param {string} url - The signed URL of the image.
   * @returns {JSX.Element} The image view component.
   */
  const displayImage = (url: string): JSX.Element => {
    if (!url) {
      return <FileSkeleton />;
    }

    const image = (
      <Image
        src={url}
        alt={file.name}
        width={80}
        height={80}
        style={{ objectFit: 'contain', width: '80px', height: '80px' }}
      />
    );

    return (
      <FileViewContainer
        view={image}
        title={file.name}
        s3ObjectKey={file.key}
      />
    );
  };

  return (
    <>
      {IMAGE_TYPES.includes(file.name.split('.').pop() || '') ? (
        displayImage(url || '')
      ) : (
        <FileTypesView file={file} />
      )}
    </>
  );
}
