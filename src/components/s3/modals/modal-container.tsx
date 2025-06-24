'use client';

import CreateObjectModal from '@/components/s3/modals/create-object-modal';

import DeleteObjectModal from '@/components/s3/modals/delete-object-modal';
import GoToDirectoryModal from '@/components/s3/modals/go-to-directory-modal';
import MultipleFileUploadModal from '@/components/s3/modals/multiple-file-upload-modal';
import S3TaskBlockingNotificationModal from '@/components/s3/modals/s3-task-blocking-notification-modal';
import SingleFileUploadModal from '@/components/s3/modals/single-file-upload-modal';
import RenameObjectModal from './rename-object-modal';

/**
 * ModalsContainer component
 * This component serves as a container for all S3-related modals.
 * @constructor
 */
export function ModalsContainer() {
  return (
    <div className='modals-container'>
      <GoToDirectoryModal />
      <SingleFileUploadModal />
      <RenameObjectModal />
      <DeleteObjectModal />
      <CreateObjectModal />
      <S3TaskBlockingNotificationModal />
      <MultipleFileUploadModal />
    </div>
  );
}
