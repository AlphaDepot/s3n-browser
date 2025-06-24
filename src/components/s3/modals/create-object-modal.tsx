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
import {useS3Navigation, useS3ObjectOperations} from '@/hooks/s3';
import useModal from '@/hooks/use-modal';
import {FileOperationType, Modals} from '@/lib/enums';

import {FormEvent, useEffect, useRef, useState} from 'react';
import {toast} from 'sonner';

/**
 * Modal component for creating a new folder in an S3 bucket.
 *
 * This modal allows users to input a folder name and create a new folder
 * in the current S3 directory. It handles input validation, folder creation,
 * and provides feedback to the user on success or failure.
 */
export default function CreateObjectModal() {
  // Modal state management
  const { isOpen, closeModalAction } = useModal(Modals.CreateFolder);
  // S3 navigation and object management hooks
  const { getPath } = useS3Navigation();
  const { setOperationContext, resetFileOperation, createS3Directory } =
    useS3ObjectOperations();

  // Local state
  const [newName, setNewName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  /**
   * Effect to initialize modal state and focus input when opened.
   * Resets the state when the modal is closed.
   */
  useEffect(() => {
    if (isOpen) {
      setOperationContext(getPath(), FileOperationType.CREATE);
      inputRef.current?.focus();
    }
    if (!isOpen) {
      setNewName('');
      setIsSubmitting(false);
      resetFileOperation();
    }
  }, [isOpen, setOperationContext, getPath, resetFileOperation]);
  /**
   * Closes the modal and resets the file operation state.
   */
  const closeModal = () => {
    closeModalAction(Modals.CreateFolder);
    resetFileOperation();
  };
  /**
   * Handles the form submission for creating a new folder.
   *
   * @param {FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await createS3Directory(newName);
      if (!result?.success) {
        toast.error('Failed to create folder: ' + result.message);
        return;
      }

      closeModal();
      setNewName('');
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('An error occurred while creating the folder');
    } finally {
      setIsSubmitting(false);
    }
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
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Enter the new name for the folder you want to create.
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
              {isSubmitting ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
