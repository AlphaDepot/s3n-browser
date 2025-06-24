'use client';
import {Button} from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {useS3ObjectDetails, useS3ObjectOperations} from '@/hooks/s3';
import useModal from '@/hooks/use-modal';
import {FileOperationType, Modals} from '@/lib/enums';

import {FormEvent, useEffect, useState} from 'react';
import {toast} from 'sonner';

/**
 * Modal component for deleting an S3 object.
 *
 * This modal allows users to confirm and delete a selected S3 object.
 * It validates the selected object, handles the delete operation, and provides feedback
 * to the user on success or failure.
 */
export default function DeleteObjectModal() {
  // Actions
  const { deleteS3Object, setOperationContext } = useS3ObjectOperations();
  const { selectedS3Object } = useS3ObjectDetails();

  const { isOpen, closeModalAction } = useModal(Modals.Delete);

  // local state
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Effect to set the operation context when the modal is opened
   * and reset the submission state when the modal is closed.
   */
  useEffect(() => {
    // Set the source key for the delete operation
    if (isOpen && selectedS3Object) {
      setOperationContext(selectedS3Object.key, FileOperationType.DELETE);
    }

    // Reset submitting state when modal closes
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen, selectedS3Object, setOperationContext]);

  /**
   * Handles the form submission for deleting the S3 object.
   *
   * @param {FormEvent<HTMLFormElement>} e - The form submission event.
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate selectedS3Object
    if (!selectedS3Object) {
      toast.error('No S3 object selected');
      setIsSubmitting(false);
      return;
    }

    await deleteS3Object().finally(() => {
      setIsSubmitting(false);
      closeModal();
    });
  };
  /**
   * Closes the modal.
   */
  const closeModal = () => {
    closeModalAction(Modals.Delete);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          closeModal();
        }
      }}
    >
      <DialogContent
        className='sm:max-w-[425px]'
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={() => !isSubmitting && closeModal()}
      >
        <DialogHeader>
          <DialogTitle>Delete object</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this object? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <DialogFooter>
            <Button
              type='button'
              variant='ghost'
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className='bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
              type='submit'
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
