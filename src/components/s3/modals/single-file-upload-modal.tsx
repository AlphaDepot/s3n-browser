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
import {Progress} from '@/components/ui/progress';
import useS3UploadOperations from '@/hooks/s3/use-s3-upload-operations';
import useModal from '@/hooks/use-modal';
import {Modals} from '@/lib/enums';
import {readableFileSize} from '@/lib/file-utilities';
import logger from '@/lib/logging/logger';

import React, {useEffect, useRef} from 'react';
import {toast} from 'sonner';

/**
 * Component for a modal that handles single file uploads to S3.
 *
 * This modal allows users to select a file, optionally overwrite existing files,
 * and upload the file to the S3 bucket. It also provides progress feedback and
 * error handling during the upload process.
 */
export default function SingleFileUploadModal() {
  // Stored state
  const { isOpen, closeModalAction } = useModal(Modals.Upload);
  const {
    files,
    currentFile,
    progress,
    fileNameExist,
    isSubmitting,
    overwriteExisting,
    setFiles,
    setOverwriteExisting,
    uploadSingleFile,
    cancelUpload,
    resetState,
    validateFiles,
  } = useS3UploadOperations();

  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Manages focus and resets state when the modal opens or closes.
   */
  useEffect(() => {
    if (isOpen && fileInputRef.current) {
      setTimeout(() => fileInputRef.current?.focus(), 100);
    }

    // Reset states when modal closes
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);
  /**
   * Handles the form submission for uploading a file.
   *
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || progress > 0) return;

    if (!files) {
      toast.error('Please select a file');
      return;
    }

    const isValid = await validateFiles();
    if (!isValid.success) {
      toast.error(isValid.message);
      return;
    }

    try {
      const result = await uploadSingleFile(files[0], overwriteExisting);
      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success('File uploaded successfully');
      closeModal();
    } catch (error) {
      logger.error('Error during file upload:', error);
      toast.error('An error occurred during the upload');
    }
  };
  /**
   * Handles changes to the file input field.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The file input change event.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles([e.target.files[0]]);
    } else {
      setFiles([]);
    }
  };
  /**
   * Cancels the ongoing file upload.
   */
  const handleCancel = () => {
    cancelUpload();
    toast('Upload cancelled');
  };
  /**
   * Handles the modal close action, including confirmation for ongoing uploads.
   */
  const handleClose = () => {
    if (progress > 0) {
      const shouldCancel = window.confirm('Upload in progress. Cancel upload?');
      if (shouldCancel) {
        cancelUpload();
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
    closeModalAction(Modals.Upload);
  };

  const isUploading = progress > 0;
  const isDisabled = files.length <= 0 || isUploading || isSubmitting;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !(isUploading || isSubmitting)) {
          handleClose();
        }
      }}
    >
      <DialogContent
        className='sm:max-w-[425px]'
        onEscapeKeyDown={() => !isDisabled && handleClose()}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Select a file to upload to the currently shown directory.
            </DialogDescription>
          </DialogHeader>
          <div className='flex flex-col gap-4 py-4'>
            <Input
              type='file'
              name='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isUploading}
              className='cursor-pointer'
            />
            {currentFile && (
              <div className='text-muted-foreground text-sm'>
                Selected file: {currentFile.name} (
                {readableFileSize(currentFile.size)})
              </div>
            )}
            <div className='flex items-center space-x-2'>
              <Checkbox
                id='overwrite'
                checked={overwriteExisting}
                onCheckedChange={(checked) => setOverwriteExisting(!!checked)}
                disabled={isUploading}
              />
              <label
                htmlFor='overwrite'
                className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Overwrite existing files
              </label>
            </div>
          </div>

          {isUploading && (
            <div className='mb-4'>
              <Progress value={progress} className='h-2' />
              <p className='text-muted-foreground mt-1 text-right text-xs'>
                {progress.toFixed(0)}% complete
              </p>
            </div>
          )}

          {fileNameExist && (
            <div className='mb-4 text-sm text-red-500'>
              File with the same name already exists. Please rename or check
              Overwrite.
            </div>
          )}

          <DialogFooter className='gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            {isUploading ? (
              <Button
                type='button'
                variant='destructive'
                onClick={handleCancel}
              >
                Cancel Upload
              </Button>
            ) : (
              <Button type='submit' disabled={isDisabled}>
                {isSubmitting ? 'Processing...' : 'Upload'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
