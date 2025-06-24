'use client';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from '@/components/ui/dialog';
import {useS3ObjectOperations} from '@/hooks/s3';

import {useEffect, useState} from 'react';

/**
 * Modal component to display a blocking notification for S3 tasks.
 *
 * This modal is triggered when there is an operation message from the S3 object manager.
 * It prevents user interaction outside the modal and displays the operation message.
 */
export default function S3TaskBlockingNotificationModal() {
  // Retrieves the current operation message from the S3 object manager.
  const { operationMessage } = useS3ObjectOperations();
  // State to manage the modal's open/close status.
  const [isOpen, setIsOpen] = useState(false);
  // State to store the operation message to be displayed in the modal.
  const [message, setMessage] = useState<string | null>('');

  /**
   * Effect to update the modal's open state and message whenever the operation message changes.
   */
  useEffect(() => {
    setIsOpen(Boolean(operationMessage && operationMessage.trim() !== ''));
    setMessage(operationMessage);
  }, [operationMessage]);

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className='z-10 sm:max-w-[425px] [&>button]:hidden'
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div>{message}</div>
      </DialogContent>
    </Dialog>
  );
}
