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
import {useS3Navigation} from '@/hooks/s3';
import useModal from '@/hooks/use-modal';
import {Modals} from '@/lib/enums';
import React, {useState} from 'react';
import {toast} from 'sonner';

/**
 * Modal component for navigating to a specific S3 directory.
 *
 * This modal allows users to input a directory path and navigate to it.
 * It validates and cleans the input path before performing the navigation.
 */
export default function GoToDirectoryModal() {
  // Modal state management
  const { isOpen, closeModalAction } = useModal(Modals.GoToDirectory);
  const { updateS3Objects } = useS3Navigation();

  // Local state for the directory path input
  const [goToLocation, setGoToLocation] = useState<string>('');
  /**
   * Cleans and formats the directory path input.
   *
   * - Removes leading slashes.
   * - Removes file names if present in the path.
   * - Ensures the path ends with a single trailing slash.
   *
   * @returns {string} The cleaned and formatted directory path.
   */
  const cleanLocationPath = () => {
    let path = goToLocation;

    // Remove leading slashes
    if (path.startsWith('/')) {
      path = path.substring(1);
    }

    // Check if the path ends with a file (contains a dot after the last slash)
    const lastSegment = path.split('/').pop();
    if (lastSegment && lastSegment.includes('.')) {
      path = path.substring(0, path.lastIndexOf('/'));
    }

    // Ensure the path ends with a single trailing slash
    if (!path.endsWith('/')) {
      path += '/';
    }

    return path;
  };
  /**
   * Handles the submission of the directory path.
   *
   * - Validates the input path.
   * - Cleans the path using `cleanLocationPath`.
   * - Navigates to the specified directory.
   */
  const handleSubmit = async () => {
    // if path is empty add toast
    const path = cleanLocationPath();
    if (path === '') {
      toast.error('Please enter a valid directory path');
      return;
    }

    setGoToLocation('');
    closeModal();
    await updateS3Objects(path);
  };
  /**
   * Closes the modal.
   */
  const closeModal = () => {
    closeModalAction(Modals.GoToDirectory);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className='sm:max-w-[425px]' onEscapeKeyDown={closeModal}>
        <DialogHeader>
          <DialogTitle>Go to directory location</DialogTitle>
          <DialogDescription>
            Enter location on input field to go to a specific directory.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='location' className='text-right'>
              Location
            </Label>
            <Input
              value={goToLocation}
              onChange={(e) => setGoToLocation(e.target.value)}
              id='location'
              className='col-span-3'
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Go</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
