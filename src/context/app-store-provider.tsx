'use client';

import { createAppStore, initStore, Store } from '@/stores';
import { createContext, type ReactNode, useContext, useRef } from 'react';
import { type StoreApi, useStore } from 'zustand';

/**
 * Context for the application store, providing access to the Zustand store.
 * This is used to share the store across the component tree.
 */
export const AppStoreContext = createContext<StoreApi<Store> | null>(null);
/**
 * Props for the `AppStoreProvider` component.
 * @property {ReactNode} children - The child components that will have access to the store.
 */
export interface AppStoreProviderProps {
  children: ReactNode;
}
/**
 * AppStoreProvider component.
 * Wraps the application with a Zustand store provider, allowing child components
 * to access the shared application state.
 *
 * @param {AppStoreProviderProps} props - The props for the provider.
 * @returns {JSX.Element} The provider component wrapping its children.
 */
export const AppStoreProvider = ({ children }: AppStoreProviderProps) => {
  // Create a ref to hold the store instance, ensuring it is only initialized once.
  const storeRef = useRef<StoreApi<Store> | null>(null);
  if (!storeRef.current) storeRef.current = createAppStore(initStore());

  return (
    <AppStoreContext.Provider value={storeRef.current}>
      {children}
    </AppStoreContext.Provider>
  );
};
/**
 * Custom hook to access the Zustand store.
 *
 * @template T The type of the selected state.
 * @param {(store: Store) => T} selector - A function to select a specific part of the store state.
 * @returns {T} The selected state.
 * @throws Will throw an error if used outside of an `AppStoreProvider`.
 */
export const useAppStore = <T,>(selector: (store: Store) => T): T => {
  // Access the store context.
  const AppStoreProvider = useContext(AppStoreContext);

  // Ensure the hook is used within a valid provider.
  if (!AppStoreProvider) {
    throw new Error('useStore must be used within an AppStoreProvider');
  }

  // Use Zustand's `useStore` to select and return the desired state.
  return useStore(AppStoreProvider, selector);
};
