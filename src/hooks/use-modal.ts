import { useAppStore } from '@/context/app-store-provider';
import { Modals } from '@/lib/enums';
import { useShallow } from 'zustand/react/shallow';

/**
 * Custom hook to manage modal state.
 *
 * This hook provides functionality to check if a specific modal is open
 * and to close the modal using the application's Zustand store.
 *
 * @param {Modals} modalName - The name of the modal to manage.
 * @returns {Object} An object containing:
 * - `isOpen` (boolean): Indicates whether the modal is open.
 * - `closeModalAction` (function): A function to close the specified modal.
 */
export default function useModal(modalName: Modals) {
  // Extract the modal's open state and the closeModal function from the store.
  const { isOpen, closeModal } = useAppStore(
    useShallow((state) => ({
      isOpen: state.modals[modalName].isOpen,
      closeModal: state.closeModal,
    }))
  );

  /**
   * Function to close the specified modal.
   *
   * @param {Modals} modal - The modal to close.
   */
  const closeModalAction = (modal: Modals) => closeModal(modal);

  return {
    isOpen,
    closeModalAction,
  };
}
