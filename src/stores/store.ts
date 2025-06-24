import {
  createModalSlice,
  initialModalState,
  ModalSlice,
  ModalState,
} from '@/stores/slices/modal-slice';
import {
  createS3BrowserPanelsSlice,
  initialS3BrowserPanelsState,
  S3BrowserPanelsSlice,
  S3BrowserPanelsState,
} from '@/stores/slices/s3-browser-panels-slice';
import {
  createS3ObjectSlice,
  initialS3ObjectState,
  S3ObjectSlice,
  S3ObjectState,
} from '@/stores/slices/s3-object-slice';
import { createStore } from 'zustand/vanilla';

/**
 * Type representing the combined slices of the store.
 */
export type Store = S3ObjectSlice & ModalSlice & S3BrowserPanelsSlice;
/**
 * Type representing the combined state of the store.
 */
export type StoreState = S3ObjectState & ModalState & S3BrowserPanelsState;
/**
 * Initializes the store state with default values from individual slices.
 *
 * @returns {StoreState} The initial state of the store.
 */
export const initStore = (): StoreState => ({
  ...initialS3ObjectState,
  ...initialModalState,
  ...initialS3BrowserPanelsState,
});
/**
 * Creates the application store by combining slices and initializing state.
 *
 * @param {StoreState} [initState=initStore()] - The initial state of the store.
 * @returns {ReturnType<typeof createStore>} The created Zustand store.
 */
export const createAppStore = (initState: StoreState = initStore()) => {
  return createStore<Store>()((set, get, store) => ({
    ...initState,
    ...createS3ObjectSlice(set, get, store),
    ...createModalSlice(set, get, store),
    ...createS3BrowserPanelsSlice(set, get, store),
  }));
};
