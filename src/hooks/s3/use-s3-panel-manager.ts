'use client';
import {useAppStore} from '@/context/app-store-provider';
import {S3BrowserPanels} from '@/lib/enums';

import {useCallback, useEffect, useRef} from 'react';
import {ImperativePanelHandle} from 'react-resizable-panels';
import {useShallow} from 'zustand/react/shallow';

/**
 * Custom hook to manage the S3 browser panel layout and interactions.
 *
 * This hook provides functionality to:
 * - Manage the size of the right panel.
 * - Handle resizing of panels.
 * - Reset the selected S3 object when necessary.
 * - Handle clicking outside the main panel to reset the right panel size.
 */
export default function useS3PanelManager() {
  // App Store
  const {
    resetSelectedS3Object,
    selectedS3Object,
    setPanelSize,
    shouldShowRightPanel,
    rightPanelSize,
  } = useAppStore(
    useShallow((state) => ({
      selectedS3Object: state.selectedS3Object,
      shouldShowRightPanel: state.showSelectedS3ObjectDetails,
      resetSelectedS3Object: state.resetSelectedS3Object,
      setPanelSize: state.setPanelSize,
      rightPanelSize: state.getPanelSize(S3BrowserPanels.RightPanel),
    }))
  );

  // refs
  const leftPanelRef = useRef<ImperativePanelHandle | null>(null);
  const mainPanelRef = useRef<ImperativePanelHandle | null>(null);
  const rightPanelRef = useRef<ImperativePanelHandle | null>(null);

  /**
   * Sets the size of the right panel in the store.
   *
   * @param {number} size - The new size of the right panel.
   */
  const setRightPanelSize = useCallback(
    (size: number) => {
      setPanelSize(S3BrowserPanels.RightPanel, size);
    },
    [setPanelSize]
  );

  /**
   * Handles resizing of the right panel and optionally resets the selected S3 object.
   *
   * @param {number} size - The new size of the right panel.
   * @param {boolean} resetTheSelectedItem - Whether to reset the selected S3 object.
   */
  const handleRightPanelResize = useCallback(
    (size: number, resetTheSelectedItem: boolean) => {
      // Update the size in the store
      setRightPanelSize(size);
      // Resize the right panel
      rightPanelRef.current?.resize(size);
      // Reset the selected item if needed
      if (resetTheSelectedItem) {
        resetSelectedS3Object();
      }
    },
    [setRightPanelSize, resetSelectedS3Object]
  );

  // Effect to manage panel size based on selected item
  useEffect(() => {
    if (selectedS3Object && shouldShowRightPanel) {
      handleRightPanelResize(25, false); // Set the right panel size to 25% when an item is selected
    }
  }, [
    handleRightPanelResize,
    rightPanelSize,
    selectedS3Object,
    setRightPanelSize,
    shouldShowRightPanel,
  ]);

  // Effect to handle clicks outside the main panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Reset the right panel size if the click is on the main panel and not any of its children
      // Note the class name 'main-page-content' comes from the main div in the page.tsx file
      if (
        target.classList.contains('main-page-content') &&
        rightPanelSize > 0
      ) {
        handleRightPanelResize(0, true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleRightPanelResize, mainPanelRef, rightPanelSize, setRightPanelSize]);

  return {
    selectedPanelItem: selectedS3Object,
    rightPanelSize,
    setRightPanelSize,
    leftPanelRef,
    rightPanelRef,
    mainPanelRef,
  };
}
