import {
  createS3PathSlice,
  initialS3PathState,
  S3PathSlice,
  S3PathState,
} from '@/stores/slices/s3-path-slice';

import { persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';

/**
 * Type representing the persisted store, which includes the S3 path slice.
 */
export type PersistedStore = S3PathSlice;
/**
 * Type representing the state of the persisted store.
 */
export type PersistedStoreState = S3PathState;
/**
 * Initializes the persisted store state with default values from the S3 path slice.
 *
 * @returns {PersistedStoreState} The initial state of the persisted store.
 */
export const initialPersistedStore = (): PersistedStoreState => ({
  ...initialS3PathState,
});
/**
 * Creates the persisted application store by combining slices and enabling persistence.
 *
 * @param {PersistedStoreState} [initState=initialPersistedStore()] - The initial state of the persisted store.
 * @returns {ReturnType<typeof createStore>} The created Zustand store with persistence enabled.
 */
export const createPersistedAppStore = (
  initState: PersistedStoreState = initialPersistedStore()
) => {
  return createStore<PersistedStore>()((set, get, store) => ({
    ...initState,
    ...persist(createS3PathSlice, {
      // Using Persist causes issues readign other slices
      name: 's3-path', // unique name for the storage
      partialize: (state) => ({ path: state.path }),
    })(set, get, store),
  }));
};
