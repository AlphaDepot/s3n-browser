import { StateCreator } from 'zustand/vanilla';

/**
 * Interface representing the state of the S3 path.
 */
export interface S3PathState {
  /** The current path in the S3 bucket. */
  path: string;
}

/**
 * Interface representing the actions that can be performed on the S3 path state.
 */
export interface S3PathActions {
  /**
   * Sets the current path in the S3 bucket.
   *
   * @param {string} path - The new path to set.
   */
  setPath: (path: string) => void;

  /**
   * Retrieves the current path in the S3 bucket.
   *
   * @returns {string} The current path.
   */
  getPath: () => string;
}

/**
 * Type representing the combined state and actions for the S3 path slice.
 */
export type S3PathSlice = S3PathState & S3PathActions;

/**
 * The initial state of the S3 path slice.
 */
export const initialS3PathState: S3PathState = {
  path: '',
};

/**
 * Factory function to create the S3 path slice.
 *
 * This function initializes the state and provides actions to manage the S3 path.
 *
 * @param {Function} set - Zustand's `set` function to update the state.
 * @param {Function} get - Zustand's `get` function to retrieve the current state.
 * @returns {S3PathSlice} The S3 path slice containing state and actions.
 */
export const createS3PathSlice: StateCreator<
  S3PathSlice,
  [],
  [],
  S3PathSlice
> = (set, get) => ({
  ...initialS3PathState,

  /**
   * Sets the current path in the S3 bucket.
   *
   * If the provided path is `/` or an empty string, it resets the path to an empty string.
   * Otherwise, it formats the path to ensure it does not start with `/` and ends with `/`.
   *
   * @param {string} key - The new path to set.
   */
  setPath: (key: string) => {
    if (key === '/' || key === '') {
      set({ path: '' });
      return;
    }
    key = key.replace(/^\//, '');
    const formattedPath = key.endsWith('/') ? key : `${key}/`;
    set({ path: formattedPath });
  },

  /**
   * Retrieves the current path in the S3 bucket.
   *
   * @returns {string} The current path.
   */
  getPath: () => get().path,
});
