import { getSignedUrlAction } from '@/actions/s3-actions';
import { FileOperationType } from '@/lib/enums';
import { S3Object } from '@/lib/s3';
import { StateCreator } from 'zustand/vanilla';

/**
 * Interface representing the state of the S3 object slice.
 */
export interface S3ObjectState {
  /** List of S3 objects. */
  s3Objects: S3Object[];
  /** The currently selected S3 object. */
  selectedS3Object: S3Object | null;
  /** Clean URL of the selected S3 object (without query parameters). */
  selectedS3ObjectCleanUrl: string | null;
  /** Flag indicating whether to show details of the selected S3 object. */
  showSelectedS3ObjectDetails: boolean;
  /** Source key for file operations. */
  sourceKey: string | null;
  /** Destination key for file operations. */
  destinationKey: string | null;
  /** New name for renaming operations. */
  newName: string | null;
  /** Type of the current file operation. */
  operationType: FileOperationType | null;
  /** Message related to the current file operation. */
  operationMessage: string | null;
}

/**
 * Interface representing the actions that can be performed on the S3 object slice.
 */
export interface S3ObjectActions {
  /**
   * Sets the list of S3 objects.
   * @param {S3Object[]} directories - The list of S3 objects to set.
   */
  setS3Objects: (directories: S3Object[]) => void;

  /**
   * Sets the selected S3 object and fetches its clean URL.
   * @param {S3Object} selectedItem - The S3 object to select.
   */
  setSelectedS3Object: (selectedItem: S3Object) => void;

  /**
   * Sets the source key for file operations.
   * @param {string} sourceKey - The source key to set.
   */
  setSourceKey: (sourceKey: string) => void;

  /**
   * Sets the destination key for file operations.
   * @param {string} destinationKey - The destination key to set.
   */
  setDestinationKey: (destinationKey: string) => void;

  /**
   * Sets the new name for renaming operations.
   * @param {string} newName - The new name to set.
   */
  setNewName: (newName: string) => void;

  /**
   * Sets the type of the current file operation.
   * @param {FileOperationType} operationType - The type of operation to set.
   */
  setOperationType: (operationType: FileOperationType) => void;

  /**
   * Resets the selected S3 object and related state.
   */
  resetSelectedS3Object: () => void;

  /**
   * Retrieves an S3 object by its key.
   * @param {string} key - The key of the S3 object to retrieve.
   * @returns {S3Object | null} The S3 object if found, otherwise null.
   */
  getObjectFromKey: (key: string) => S3Object | null;

  /**
   * Sets whether to show details of the selected S3 object.
   * @param {boolean} show - Flag indicating whether to show details.
   */
  setShowSelectedS3ObjectDetails: (show: boolean) => void;

  /**
   * Resets the state related to file operations.
   */
  resetFileOperation: () => void;

  /**
   * Sets the message related to the current file operation.
   * @param {string} message - The operation message to set.
   */
  setOperationMessage: (message: string) => void;
}

/**
 * Type representing the combined state and actions for the S3 object slice.
 */
export type S3ObjectSlice = S3ObjectState & S3ObjectActions;

/**
 * The initial state of the S3 object slice.
 */
export const initialS3ObjectState: S3ObjectState = {
  s3Objects: [],
  selectedS3Object: null,
  selectedS3ObjectCleanUrl: null,
  showSelectedS3ObjectDetails: false,
  sourceKey: null,
  destinationKey: null,
  newName: null,
  operationType: null,
  operationMessage: null,
};

/**
 * Factory function to create the S3 object slice.
 *
 * This function initializes the state and provides actions to manage S3 objects.
 *
 * @param {Function} set - Zustand's `set` function to update the state.
 * @param {Function} get - Zustand's `get` function to retrieve the current state.
 * @returns {S3ObjectSlice} The S3 object slice containing state and actions.
 */
export const createS3ObjectSlice: StateCreator<
  S3ObjectSlice,
  [],
  [],
  S3ObjectSlice
> = (set, get) => ({
  ...initialS3ObjectState,

  setS3Objects: (s3Objects) => set({ s3Objects }),

  setSelectedS3Object: async (selectedS3Object: S3Object) => {
    set({ selectedS3Object });
    // Set the clean URL of the selected S3 object if its key is present
    const { key } = selectedS3Object;
    if (!key) return;
    const signedUrlResult = await getSignedUrlAction(key);
    set({ selectedS3ObjectCleanUrl: signedUrlResult?.data?.split('?')[0] });
  },

  setSourceKey: (sourceKey) => set({ sourceKey }),

  setDestinationKey: (destinationKey) => set({ destinationKey }),

  setNewName: (newName) => set({ newName }),

  setOperationType: (operationType) => set({ operationType }),

  resetSelectedS3Object: () =>
    set({
      selectedS3Object: null,
      selectedS3ObjectCleanUrl: null,
      showSelectedS3ObjectDetails: false,
      newName: null,
    }),

  getObjectFromKey: (key) => {
    const s3Objects = (get() as S3ObjectSlice).s3Objects;
    return s3Objects.find((obj) => obj.key === key) || null;
  },

  setShowSelectedS3ObjectDetails: (show) =>
    set({ showSelectedS3ObjectDetails: show }),

  resetFileOperation: () =>
    set({
      sourceKey: null,
      destinationKey: null,
      newName: null,
      operationType: null,
      operationMessage: null,
    }),

  setOperationMessage: (message) => set({ operationMessage: message }),
});
