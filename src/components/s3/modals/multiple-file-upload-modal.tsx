'use client';
import {Button} from '@/components/ui/button';
import {Checkbox} from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import useModal from '@/hooks/use-modal';
import {Modals} from '@/lib/enums';
import {readableFileSize} from '@/lib/file-utilities';

import React, {useEffect, useRef} from 'react';
import {toast} from 'sonner';
import useS3UploadOperations from '../../../hooks/s3/use-s3-upload-operations';
import UploadFileStatusList from './upload-file-status-list';

/**
 * Component for uploading multiple files to an S3 bucket.
 *
 * This modal allows users to select multiple files, view their upload status,
 * and manage upload options such as overwriting existing files. It also handles
 * validation, progress tracking, and error reporting for file uploads.
 */
export default function MultipleFileUploadModal() {
  // Modal state management
  const { isOpen, closeModalAction } = useModal(Modals.MultiUpload);
  // S3 upload manager hooks
  const {
    files,
    fileStatuses,
    isSubmitting,
    overwriteExisting,
    setFiles,
    setOverwriteExisting,
    uploadMultipleFiles,
    cancelAllUploads,
    resetState,
    validateFiles,
  } = useS3UploadOperations();
  // Reference to the file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Focus management and state reset when modal opens or closes
  useEffect(() => {
    if (isOpen && fileInputRef.current) {
      setTimeout(() => fileInputRef.current?.focus(), 100);
    }

    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  /**
   * Handles file selection changes.
   *
   * @param e - The file input change event.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setFiles(fileArray);
    } else {
      setFiles([]);
    }
  };

  /**
   * Handles form submission to upload files.
   *
   * @param e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const isValid = await validateFiles();
    if (!isValid.success) {
      toast.error(isValid.message);
      return;
    }

    const { successCount, errorCount } =
      await uploadMultipleFiles(overwriteExisting);

    if (successCount > 0 && errorCount === 0) {
      toast.success(`Successfully uploaded ${successCount} file(s)`);
      closeModal();
    } else if (successCount > 0 && errorCount > 0) {
      toast.warning(`Uploaded ${successCount} file(s), ${errorCount} failed`);
    } else {
      toast.error('All uploads failed');
    }
  };

  /**
   * Handles modal close action, including canceling uploads if necessary.
   */
  const handleClose = () => {
    const uploading = fileStatuses.some(
      (status) => status.status === 'uploading'
    );

    if (uploading) {
      const shouldCancel = window.confirm(
        'Uploads in progress. Cancel all uploads?'
      );
      if (shouldCancel) {
        cancelAllUploads();
        toast('All uploads cancelled');
      } else {
        return;
      }
    }

    resetState();
    closeModal();
  };
  /**
   * Closes the modal.
   */
  const closeModal = () => {
    closeModalAction(Modals.MultiUpload);
  };
  // Check if any file is currently uploading
  const anyUploading = fileStatuses.some(
    (status) => status.status === 'uploading'
  );

  // Disable the upload button if no files are selected or submission is ongoing
  const isDisabled = files.length === 0 || isSubmitting;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !(anyUploading || isSubmitting)) {
          handleClose();
        }
      }}
    >
      <DialogContent
        className='sm:max-w-[550px]'
        onEscapeKeyDown={() => !isDisabled && handleClose()}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Multiple Files</DialogTitle>
            <DialogDescription>
              Select multiple files to upload to the current directory.
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col gap-4 py-4'>
            <Input
              type='file'
              multiple
              name='files'
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isSubmitting || anyUploading}
              className='cursor-pointer'
            />

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='overwrite'
                checked={overwriteExisting}
                onCheckedChange={(checked) => setOverwriteExisting(!!checked)}
                disabled={isSubmitting || anyUploading}
              />
              <label
                htmlFor='overwrite'
                className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Overwrite existing files
              </label>
            </div>

            {files.length > 0 && (
              <div className='text-muted-foreground text-sm'>
                Selected {files.length} file(s) - Total size:{' '}
                {readableFileSize(
                  files.reduce((acc, file) => acc + file.size, 0)
                )}
              </div>
            )}

            {fileStatuses.length > 0 && (
              <div className='max-h-[200px] overflow-y-auto rounded-md border p-2'>
                <UploadFileStatusList fileStatuses={fileStatuses} />
              </div>
            )}
          </div>

          <DialogFooter className='gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            {anyUploading ? (
              <Button
                type='button'
                variant='destructive'
                onClick={() => {
                  cancelAllUploads();
                  toast('All uploads cancelled');
                }}
              >
                Cancel Uploads
              </Button>
            ) : (
              <Button type='submit' disabled={isDisabled}>
                {isSubmitting ? 'Processing...' : 'Upload All'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
