import { Modals } from '@/lib/enums';
import { StateCreator } from 'zustand/vanilla';

/**
 * Interface representing the state of modals in the application.
 */
export interface ModalState {
  /**
   * A record of modal names to their respective states.
   * Each modal state includes the modal name and whether it is open.
   */
  modals: Record<string, { modalName: Modals; isOpen: boolean }>;
}

/**
 * Interface representing the actions that can be performed on modals.
 */
export interface ModalActions {
  /**
   * Opens a modal by its name.
   *
   * @param {Modals} modalName - The name of the modal to open.
   */
  openModal: (modalName: string) => void;

  /**
   * Closes a modal by its name.
   *
   * @param {Modals} modalName - The name of the modal to close.
   */
  closeModal: (modalName: string) => void;
}

/**
 * Type representing the combined state and actions for modals.
 */
export type ModalSlice = ModalState & ModalActions;

/**
 * The initial state of the modals.
 * Each modal is initialized with its name and a closed state (`isOpen: false`).
 */
export const initialModalState: ModalState = {
  modals: {
    [Modals.GoToDirectory]: { modalName: Modals.GoToDirectory, isOpen: false },
    [Modals.Upload]: { modalName: Modals.Upload, isOpen: false },
    [Modals.MultiUpload]: { modalName: Modals.MultiUpload, isOpen: false },
    [Modals.Delete]: { modalName: Modals.Delete, isOpen: false },
    [Modals.Rename]: { modalName: Modals.Rename, isOpen: false },
    [Modals.Share]: { modalName: Modals.Share, isOpen: false },
    [Modals.Download]: { modalName: Modals.Download, isOpen: false },
    [Modals.Move]: { modalName: Modals.Move, isOpen: false },
    [Modals.Copy]: { modalName: Modals.Copy, isOpen: false },
    [Modals.Properties]: { modalName: Modals.Properties, isOpen: false },
    [Modals.SignUrl]: { modalName: Modals.SignUrl, isOpen: false },
    [Modals.CreateFolder]: { modalName: Modals.CreateFolder, isOpen: false },
  },
};

/**
 * Factory function to create the modal slice.
 *
 * This function initializes the state and provides actions to manage modals.
 *
 * @param {Function} set - Zustand's `set` function to update the state.
 * @returns {ModalSlice} The modal slice containing state and actions.
 */
export const createModalSlice: StateCreator<ModalSlice, [], [], ModalSlice> = (
  set
) => ({
  ...initialModalState,

  /**
   * Opens a modal by setting its `isOpen` property to `true`.
   *
   * @param {string} modalName - The name of the modal to open.
   */
  openModal: (modalName) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: { ...state.modals[modalName], isOpen: true },
      },
    })),

  /**
   * Closes a modal by setting its `isOpen` property to `false`.
   *
   * @param {string} modalName - The name of the modal to close.
   */
  closeModal: (modalName) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalName]: { ...state.modals[modalName], isOpen: false },
      },
    })),
});
