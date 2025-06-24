'use client';
import SelectedItemView from '@/components/s3/files/selected-item-view';
import {ResizableHandle, ResizablePanel, ResizablePanelGroup,} from '@/components/ui/resizable';
import {useS3PanelManager} from '@/hooks/s3';
import {ReactNode} from 'react';

interface MainLayoutPanelGroupProps {
  children: ReactNode;
}
/**
 * Handles the form submission for creating a new folder.
 *
 * @param {FormEvent} e - The form submission event.
 */
export default function S3BrowserLayoutPanelGroup({
  children,
}: MainLayoutPanelGroupProps) {
  // Retrieve references and size configuration for the panels from the S3 browser panel manager.
  const { rightPanelRef, rightPanelSize, mainPanelRef } =
    useS3PanelManager();

  return (
    <ResizablePanelGroup
      direction='horizontal'
      className='borderflex min-h-0 flex-grow flex-nowrap'
    >
      <ResizablePanel minSize={50} ref={mainPanelRef}>
        {children}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={rightPanelSize}
        maxSize={25}
        ref={rightPanelRef || 0}
      >
        <SelectedItemView />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
