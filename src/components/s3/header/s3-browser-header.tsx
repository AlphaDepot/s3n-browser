'use client';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from '@/components/ui/menubar';
import {useAppStore} from '@/context/app-store-provider';
import {useS3Navigation, useS3ObjectOperations} from '@/hooks/s3';
import {Modals, S3ObjectsSortBy, SortDirection} from '@/lib/enums';
import {s3ObjectsSort} from '@/lib/s3/s3-helpers';

import {
  ArrowDown,
  ArrowDownUp,
  ArrowsUpFromLine,
  ArrowUp,
  Calendar,
  Database,
  File,
  FileText,
  FileType,
  FileUp,
  FolderPlus,
  FolderUp,
  ListRestart,
  Locate,
} from 'lucide-react';
import {useState} from 'react';
import {useShallow} from 'zustand/react/shallow';

/**
 * Header component for the S3 browser.
 *
 * This component provides a menubar with options to navigate directories,
 * create folders, upload files, and sort S3 objects. It also includes
 * functionality to reset sorting and navigate to specific locations.
 */
export default function S3BrowserHeader() {
  // Hook to navigate to the parent directory and check if the current directory is the root

  const { toParentDirectory, isRoot } = useS3Navigation();
  // Hook to manage application state, including opening modals

  const { openModal } = useAppStore(
    useShallow((state) => ({
      openModal: state.openModal,
    }))
  );
  // Hook to manage S3 objects and their sorting

  const { setS3Objects, s3Objects } = useS3ObjectOperations();
  // State to track the current sorting configuration
  const [sortConfig, setSortConfig] = useState<{
    by: S3ObjectsSortBy | null;
    direction: SortDirection | null;
    active: boolean;
  }>({
    by: null,
    direction: null,
    active: false,
  });
  /**
   * Handles sorting of S3 objects based on the selected criteria.
   *
   * @param {S3ObjectsSortBy} sortBy - The field to sort by (e.g., name, size, date, type).
   * @param {boolean} [reset=false] - Whether to reset the sorting configuration.
   */
  const handleSort = (sortBy: S3ObjectsSortBy, reset: boolean = false) => {
    const newDirection =
      sortConfig.by === sortBy && sortConfig.direction === SortDirection.ASC
        ? SortDirection.DESC
        : SortDirection.ASC;

    // Update sort configuration
    setSortConfig({
      by: reset ? null : sortBy,
      direction: reset ? null : newDirection,
      active: !reset,
    });

    // Sort objects
    setS3Objects(s3ObjectsSort(s3Objects, newDirection, sortBy, reset));
  };
  /**
   * Retrieves the appropriate icon for the current sort direction.
   *
   * @param {S3ObjectsSortBy} sortBy - The field to check the sort direction for.
   * @returns {JSX.Element | null} The icon representing the sort direction, or null if not sorted.
   */
  const getSortDirectionIcon = (sortBy: S3ObjectsSortBy) => {
    if (sortConfig.by !== sortBy || !sortConfig.direction) return null;

    return sortConfig.direction === SortDirection.ASC ? (
      <ArrowUp className='ml-2 h-4 w-4' />
    ) : (
      <ArrowDown className='ml-2 h-4 w-4' />
    );
  };

  return (
    <div>
      <Menubar className='main-page-header rounded-b-none'>
        <MenubarMenu>
          <MenubarTrigger
            disabled={isRoot}
            onClick={() => toParentDirectory()}
            className={
              isRoot ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }
          >
            <FolderUp className='mr-1 h-4 w-4 opacity-75' />
            <span>Up</span>
          </MenubarTrigger>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className='cursor-pointer'>
            <File className='mr-1 h-4 w-4 opacity-75' />
            <span>Files</span>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={() => openModal(Modals.CreateFolder)}>
              <FolderPlus />
              <span>New Folder</span>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => openModal(Modals.Upload)}>
              <FileUp />
              <span>Upload File</span>
            </MenubarItem>
            <MenubarItem onClick={() => openModal(Modals.MultiUpload)}>
              <ArrowsUpFromLine />
              Upload Multiple Files
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem onClick={() => openModal(Modals.GoToDirectory)}>
              <Locate />
              <span>Go To Location</span>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>

        {/* Right-aligned menus */}
        <div className='ml-auto'>
          <MenubarMenu>
            <MenubarTrigger className='cursor-pointer'>
              <ArrowDownUp className='mr-1 h-4 w-4 opacity-75' />
              <span>Sort</span>
            </MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={() => handleSort(S3ObjectsSortBy.NAME)}>
                <FileText />
                <span>Sort by Name</span>{' '}
                {getSortDirectionIcon(S3ObjectsSortBy.NAME)}
              </MenubarItem>
              <MenubarItem onClick={() => handleSort(S3ObjectsSortBy.SIZE)}>
                <Database />
                <span>Sort by Size</span>
                {getSortDirectionIcon(S3ObjectsSortBy.SIZE)}
              </MenubarItem>
              <MenubarItem onClick={() => handleSort(S3ObjectsSortBy.DATE)}>
                <Calendar />
                <span>Sort by Date</span>
                {getSortDirectionIcon(S3ObjectsSortBy.DATE)}
              </MenubarItem>
              <MenubarItem onClick={() => handleSort(S3ObjectsSortBy.TYPE)}>
                <FileType />
                <span>Sort by Type</span>
                {getSortDirectionIcon(S3ObjectsSortBy.TYPE)}
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem
                disabled={!sortConfig.active}
                onClick={() => handleSort(S3ObjectsSortBy.NAME, true)}
              >
                <ListRestart />
                <span>Reset Sort</span>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </div>
      </Menubar>
    </div>
  );
}
