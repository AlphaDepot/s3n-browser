'use client';
import FileTypes from '@/components/s3/files/file-types';
import {Button} from '@/components/ui/button';
import {useS3ObjectDetails} from '@/hooks/s3';

import saveToClipboard from '@/lib/clipboard-utilities';
import {secondsToTime, timeFromNow} from '@/lib/date-time';
import {getFileType, readableFileSize} from '@/lib/file-utilities';
import {S3ObjectType} from '@/lib/s3';
import {FolderIcon} from 'lucide-react';
import Image from 'next/image';
import {toast} from 'sonner';
import {JSX} from 'react';

/**
 * Copies the current S3 path to the clipboard.
 * Displays a success or error message based on the result.
 */
export default function SelectedItemView() {
  const {
    selectedS3Object,
    signingServiceUrl,
    signedUrl,
    cleanUrl,
    defaultExpiresInSeconds,
  } = useS3ObjectDetails();
  const { fileType, imageType } = getFileType(selectedS3Object?.name);

  /**
   * Renders the file viewer based on the type of the selected S3 object.
   * If the object is an image, it displays the image.
   * If it's a file, it displays the file type icon.
   * If it's a directory, it displays a folder icon.
   *
   * @returns {JSX.Element | undefined} The file viewer component.
   */
  const fileViewer = (): JSX.Element | undefined => {
    if (!selectedS3Object) {
      return;
    }

    if (imageType && (signedUrl || cleanUrl)) {
      return (
        <Image
          src={signedUrl ?? cleanUrl!}
          alt={selectedS3Object?.name}
          width={250}
          height={250}
          style={{ objectFit: 'contain', width: '250px', height: '250px' }}
        />
      );
    }

    if (fileType) {
      return <FileTypes type={fileType} size={100} />;
    }

    return <FolderIcon size={100} />;
  };

  /**
   * Checks if the selected S3 object is not a directory.
   *
   * @returns {boolean} True if the object is not a directory, false otherwise.
   */
  const isNotDirectory = (): boolean => {
    if (!selectedS3Object) {
      return false;
    }
    return selectedS3Object.type !== S3ObjectType.DIRECTORY;
  };

  /**
   * Handler to copy the signing service URL to the clipboard.
   */
  const getSignedServiceUrlHandler = async () => {
    if (!signingServiceUrl) {
      console.error('No signing service URL found');
      return;
    }
    saveToClipboard(
      signingServiceUrl,
      () => toast(`${selectedS3Object?.name} signed URL copied to clipboard`),
      (err) => {
        toast.error('Failed to copy signed URL to clipboard', {
          description: err.message,
        });
      }
    );
  };

  /**
   * Handler to copy the S3 timed URL to clipboard.
   */
  const getS3TimedUrlHandler = async (): Promise<void> => {
    if (!signedUrl) {
      console.error('No signed URL found');
      return;
    }
    saveToClipboard(
      signedUrl,
      () => toast(`${selectedS3Object?.name} timed URL copied to clipboard`),
      (err) => {
        toast.error('Failed to copy timed URL to clipboard', {
          description: err.message,
        });
      }
    );
  };

  /**
   * Handler to copy the clean S3 URL without time parameters to clipboard.
   */
  const getCleanUrlHandler = async (): Promise<void> => {
    if (!cleanUrl) {
      return;
    }
    saveToClipboard(
      cleanUrl,
      () => toast(`${selectedS3Object?.name} clean URL copied to clipboard`),
      (err) => {
        toast.error('Failed to copy clean URL to clipboard', {
          description: err.message,
        });
      }
    );
  };

  /**
   * Button to copy the signed service URL.
   * Only displayed if `signingServiceUrl` is available.
   *
   * @returns {JSX.Element | undefined} The button component.
   */
  const signedServiceUrlButton = (): JSX.Element | undefined => {
    if (!signingServiceUrl) {
      return;
    }
    return (
      <Button onClick={getSignedServiceUrlHandler}>
        <span>Copy Signing Service URL</span>
      </Button>
    );
  };

  /**
   * Button to copy the S3 timed URL.
   * Only displayed if `signedUrl` is available.
   *
   * @returns {JSX.Element} The button component.
   */
  const s3TimedUrlButton = (): JSX.Element | undefined => {
    return (
      <Button onClick={getS3TimedUrlHandler} className='whitespace-normal'>
        <span>
          Copy Timed URL (Expires in&nbsp;
          {defaultExpiresInSeconds && secondsToTime(defaultExpiresInSeconds)})
        </span>
      </Button>
    );
  };

  /**
   * Button to copy the clean S3 URL.
   * Only displayed if `cleanUrl` is available.
   *
   * @returns {JSX.Element | undefined} The button component.
   */
  const cleanUrlButton = (): JSX.Element | undefined => {
    if (!cleanUrl) {
      return;
    }
    return (
      <Button onClick={getCleanUrlHandler}>
        <span>Copy S3 URL</span>
      </Button>
    );
  };

  /**
   * Renders the action buttons for the selected S3 object.
   * Includes buttons to copy the signed service URL, S3 timed URL, and clean S3 URL.
   *
   * @returns {JSX.Element} The container for action buttons.
   */
  const actionButtons = (): JSX.Element | undefined => {
    return (
      <div className='buttons my-2 flex flex-col gap-2 border-t-2 py-2'>
        {cleanUrl && s3TimedUrlButton()}
        {cleanUrlButton()}
        {signedUrl && signedServiceUrlButton()}
      </div>
    );
  };

  return (
    <div className='p-2'>
      {selectedS3Object && (
        <div>
          <div className='my-2 flex items-center justify-center border-b-2 py-2'>
            {fileViewer()}
          </div>

          <div>
            <div>
              Last updated: {timeFromNow(selectedS3Object.object?.LastModified)}
            </div>
            <div>
              <b>Type:</b> {selectedS3Object.type}
            </div>
            <div>
              <b>Name:</b> {selectedS3Object.name}
            </div>
            <div>
              <b>Size:</b>{' '}
              {readableFileSize(selectedS3Object.object?.Size || 0)}
            </div>
          </div>

          {isNotDirectory() && actionButtons()}
        </div>
      )}
    </div>
  );
}
