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
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useS3ObjectOperations} from '@/hooks/s3';
import useModal from '@/hooks/use-modal';
import {FileOperationType, Modals} from '@/lib/enums';
import {OperationResult} from '@/lib/responses/operation-result';

import {FormEvent, useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';

/**
 * Modal component for renaming an S3 object.
 *
 * This modal allows users to rename an existing S3 object by providing a new name.
 * It validates the new name, handles the renaming operation, and provides feedback
 * to the user on success or failure.
 */
export default function RenameObjectModal() {
  // Stored state
  const { isOpen, closeModalAction } = useModal(Modals.Rename);
  const { renameS3Object, setOperationContext, selectedS3Object } =
    useS3ObjectOperations();

  // Local state
  const [newName, setNewName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set the existing name of the selected S3 object as the default value
    if (isOpen && selectedS3Object) {
      setNewName(selectedS3Object.name);
      // Focus the input field when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);

      // Set the source key for the rename operation
      setOperationContext(selectedS3Object.key, FileOperationType.RENAME);
    }

    // Reset submitting state when modal closes
    if (!isOpen) {
      setIsSubmitting(false);
    }
  }, [isOpen, selectedS3Object, setOperationContext]);

  const closeModal = () => {
    closeModalAction(Modals.Rename);
  };

  /**
   * Handles the form submission for renaming the S3 object.
   * @param e
   */
  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await handleRename();
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Renames the selected S3 object with the new name provided.
   */
  const handleRename = async () => {
    // validate a new name
    const validationResult = validateSubmission(newName);

    if (!validationResult.success) {
      toast.error(validationResult.message || 'Invalid name', {
        duration: 5000,
        dismissible: true,
        closeButton: true,
      });
      return;
    }

    console.log('OperationType');

    const response = await renameS3Object(newName);

    if (!response.success) {
      toast.error(response.message || 'Failed to rename object', {
        duration: 5000,
        dismissible: true,
        closeButton: true,
      });
      return;
    }

    toast.success('Object renamed successfully');
    closeModal();
  };

  /**
   * Validates the new name for the S3 object.
   * @param newName
   */
  const validateSubmission = (newName: string) => {
    // Check name is not empty
    if (!newName || newName.trim() === '') {
      return OperationResult.Failure('New name cannot be empty');
    }
    // Check name is not the same as the current name
    if (newName === selectedS3Object?.name) {
      return OperationResult.Failure(
        'New name cannot be the same as the current name'
      );
    }

    // Check name does not contain invalid characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(newName)) {
      return OperationResult.Failure('New name contains invalid characters');
    }

    return OperationResult.Success(true);
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
          <DialogTitle>Rename Object</DialogTitle>
          <DialogDescription>
            Enter the new name for the object.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid gap-4 py-4'>
            <Label htmlFor='new-name'>New Name</Label>
            <Input
              id='new-name'
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              ref={inputRef}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='secondary'
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
