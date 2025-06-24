'use client';

import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,} from '@/components/ui/context-menu';
import {MenubarSeparator} from '@/components/ui/menubar';
import {useAppStore} from '@/context/app-store-provider';
import {useS3Navigation, useS3ObjectOperations} from '@/hooks/s3';
import {FileOperationType, Modals} from '@/lib/enums';

import {ReactNode} from 'react';
import {toast} from 'sonner';
import {useShallow} from 'zustand/react/shallow';

interface BrowserContextMenuProps {
  children: ReactNode;
}

/**
 * Component for rendering a context menu in the S3 browser.
 *
 * This context menu provides options for creating a new folder, pasting objects,
 * and copying the current location. It integrates with S3 object management
 * and navigation hooks to handle operations like copy, move, and paste.
 *
 * @param {BrowserContextMenuProps} props - The properties for the context menu component.
 */
export default function S3BrowserContextMenu({
  children,
}: BrowserContextMenuProps) {
  const { getPath } = useS3Navigation();
  const { sourceKey, operationType, moveS3Object, copyS3Object } =
    useS3ObjectOperations();
  const { openModal } = useAppStore(
    useShallow((state) => ({
      openModal: state.openModal,
    }))
  );

  /**
   * Handles the paste operation for S3 objects.
   * Depending on the operation type, it either copies or moves the object.
   */
  const handlePaste = async () => {
    if (!sourceKey) {
      console.error('No source key found');
      return;
    }
    if (operationType === FileOperationType.COPY) {
      await handleCopyObject();
    } else if (operationType === FileOperationType.MOVE) {
      await handleMovingObject();
    } else {
      console.error('Invalid operation type');
    }
  };

  /**
   * Handles the copy operation for an S3 object.
   * Displays a success or error message based on the result.
   */
  const handleCopyObject = async () => {
    const result = await copyS3Object();
    if (!result.success) {
      console.error('Failed to copy object:', result.message);
      toast.error('Failed to copy object because: ' + result.message);
      return;
    }

    toast.success('Object copied successfully');
  };

  /**
   * Handles the move operation for an S3 object.
   * Moves the object to the current path and displays a success or error message.
   */
  const handleMovingObject = async () => {
    const result = await moveS3Object();

    if (!result.success) {
      console.error('Failed to move object:', result.message);
      toast.error('Failed to move object because: ' + result.message);
      return;
    }

    toast.success('Object moved successfully');
  };

  /**
   * Copies the current S3 path to the clipboard.
   * Displays a success or error message based on the result.
   */
  const handleCopyLocation = () => {
    navigator.clipboard
      .writeText(getPath())
      .then(() => {
        toast.success('Location copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => openModal(Modals.CreateFolder)}>
          New Folder
        </ContextMenuItem>
        <MenubarSeparator />
        <ContextMenuItem onClick={handlePaste} disabled={!sourceKey}>
          Paste
        </ContextMenuItem>
        <MenubarSeparator />
        <ContextMenuItem onClick={handleCopyLocation}>
          Copy Location
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
