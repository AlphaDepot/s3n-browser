'use client';

import {
  createPersistedAppStore,
  initialPersistedStore,
  PersistedStore,
} from '@/stores';
import { createContext, type ReactNode, useContext, useRef } from 'react';
import { type StoreApi, useStore } from 'zustand';

// Use Zustand's `useStore` to select and return the desired state.

export const PersistedAppStoreContext =
  createContext<StoreApi<PersistedStore> | null>(null);
/**
 * Props for the `PersistedAppStoreProvider` component.
 * @property {ReactNode} children - The child components that will have access to the persisted store.
 */
export interface PersistedAppStoreProviderProps {
  children: ReactNode;
}

/**
 * PersistedAppStoreProvider component.
 * Wraps the application with a Zustand store provider for persisted state,
 * allowing child components to access the shared persisted application state.
 *
 * @param {PersistedAppStoreProviderProps} props - The props for the provider.
 * @returns {JSX.Element} The provider component wrapping its children.
 */
export const PersistedAppStoreProvider = ({
  children,
}: PersistedAppStoreProviderProps) => {
  // Create a ref to hold the store instance, ensuring it is only initialized once.
  const storeRef = useRef<StoreApi<PersistedStore> | null>(null);
  if (!storeRef.current)
    storeRef.current = createPersistedAppStore(initialPersistedStore());

  return (
    <PersistedAppStoreContext.Provider value={storeRef.current}>
      {children}
    </PersistedAppStoreContext.Provider>
  );
};

/**
 * Custom hook to access the Zustand persisted store.
 *
 * @template T The type of the selected state.
 * @param {(store: PersistedStore) => T} selector - A function to select a specific part of the store state.
 * @returns {T} The selected state.
 * @throws Will throw an error if used outside of a `PersistedAppStoreProvider`.
 */
export const usePersistedAppStore = <T,>(
  selector: (store: PersistedStore) => T
): T => {
  // Access the store context.
  const PersistedAppStoreProvider = useContext(PersistedAppStoreContext);

  // Ensure the hook is used within a valid provider.
  if (!PersistedAppStoreProvider) {
    throw new Error(
      'usePersistedAppStore must be used within a PersistedAppStoreProvider'
    );
  }

  // Use Zustand's `useStore` to select and return the desired state.
  return useStore(PersistedAppStoreProvider, selector);
};
