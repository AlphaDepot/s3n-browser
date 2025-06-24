'use client';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {useAppStore} from '@/context/app-store-provider';
import {FileOperationType, Modals} from '@/lib/enums';

import {MouseEvent, ReactNode} from 'react';
import {useShallow} from 'zustand/react/shallow';
import useS3ObjectOperations from '../../../hooks/s3/use-s3-object-operations';

interface FileContextMenuProps {
  /**
   * The child components to be rendered inside the context menu trigger.
   */
  children: ReactNode;

  /**
   * The S3 object key associated with the file or folder (optional).
   */
  s3ObjectKey?: string;
}
/**
 * Component for rendering a context menu for file operations.
 *
 * This component provides a context menu with options such as rename, copy, cut, and delete
 * for files or folders in an S3 browser. It uses Zustand for state management and triggers
 * modals for certain operations.
 *
 * @param {FileContextMenuProps} props - The properties for the file context menu component.
 */
export default function FileContextMenu({
  children,
  s3ObjectKey,
}: FileContextMenuProps) {
  // Actions
  const {
    getObjectFromKey,
    setSelectedS3Object,
    setSourceKey,
    setOperationType,
  } = useS3ObjectOperations();

  const { openModal } = useAppStore(
    useShallow((state) => ({
      openModal: state.openModal,
    }))
  );
  /**
   * Handles the opening of the context menu.
   * Retrieves the S3 object associated with the provided key and sets it as the selected object.
   */
  const onOpen = () => {
    if (!s3ObjectKey) return;
    const object = getObjectFromKey(s3ObjectKey);
    if (!object) return;
    setSelectedS3Object(object);
  };
  /**
   * Handles the rename operation by opening the rename modal.
   *
   * @param {MouseEvent} e - The mouse event triggered by the rename action.
   */
  const handleRename = (e: MouseEvent) => {
    e.stopPropagation();

    if (!s3ObjectKey) {
      console.error('s3ObjectKey is null');
      return;
    }
    const object = getObjectFromKey(s3ObjectKey);
    if (!object) {
      console.error('Object is null');
      return;
    }

    setSelectedS3Object(object);
    openModal(Modals.Rename);
  };
  /**
   * Handles the delete operation by opening the delete modal.
   *
   * @param {MouseEvent} e - The mouse event triggered by the delete action.
   */
  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();

    if (!s3ObjectKey) {
      console.error('s3ObjectKey is null');
      return;
    }
    const object = getObjectFromKey(s3ObjectKey);
    if (!object) {
      console.error('Object is null');
      return;
    }

    setSelectedS3Object(object);
    openModal(Modals.Delete);
  };
  /**
   * Handles the copy operation by setting the source key and operation type to COPY.
   *
   * @param {MouseEvent} e - The mouse event triggered by the copy action.
   */
  const handleCopy = (e: MouseEvent) => {
    e.stopPropagation();
    if (!s3ObjectKey) return;
    setSourceKey(s3ObjectKey);
    setOperationType(FileOperationType.COPY);
  };
  /**
   * Handles the cut operation by setting the source key and operation type to MOVE.
   *
   * @param {MouseEvent} e - The mouse event triggered by the cut action.
   */
  const handleCut = (e: MouseEvent) => {
    e.stopPropagation();
    if (!s3ObjectKey) return;
    setSourceKey(s3ObjectKey);
    setOperationType(FileOperationType.MOVE);
  };

  return (
    <ContextMenu onOpenChange={onOpen}>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem disabled={true}>Copy Link</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={(e) => handleRename(e)}>
          Rename
        </ContextMenuItem>
        <ContextMenuItem onClick={(e) => handleCopy(e)}>Copy</ContextMenuItem>
        <ContextMenuItem onClick={(e) => handleCut(e)}>Cut</ContextMenuItem>
        <ContextMenuItem
          className='text-destructive'
          onClick={(e) => handleDelete(e)}
        >
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
