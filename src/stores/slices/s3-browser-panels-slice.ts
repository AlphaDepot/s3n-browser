import { S3BrowserPanels } from '@/lib/enums';
import { StateCreator } from 'zustand/vanilla';

/**
 * Interface representing the state of an individual S3 browser panel.
 */
export interface S3BrowserPanelState {
  /** The name of the panel. */
  panelName: S3BrowserPanels;
  /** The size of the panel. */
  size: number;
}

/**
 * Interface representing the state of all S3 browser panels.
 */
export interface S3BrowserPanelsState {
  /** A record of panel names to their respective states. */
  panels: Record<string, S3BrowserPanelState>;
}

/**
 * Interface representing the actions that can be performed on S3 browser panels.
 */
export interface S3BrowserPanelsActions {
  /**
   * Sets the size of a specific panel.
   *
   * @param {S3BrowserPanels} panelName - The name of the panel to update.
   * @param {number} size - The new size of the panel.
   */
  setPanelSize: (panelName: S3BrowserPanels, size: number) => void;

  /**
   * Resets the size of a specific panel to its default value (0).
   *
   * @param {S3BrowserPanels} panelName - The name of the panel to reset.
   */
  resetPanelSize: (panelName: S3BrowserPanels) => void;

  /**
   * Retrieves the size of a specific panel.
   *
   * @param {S3BrowserPanels} panelName - The name of the panel to retrieve the size for.
   * @returns {number} The size of the specified panel.
   */
  getPanelSize: (panelName: S3BrowserPanels) => number;
}

/**
 * Type representing the combined state and actions for S3 browser panels.
 */
export type S3BrowserPanelsSlice = S3BrowserPanelsState &
  S3BrowserPanelsActions;

/**
 * The initial state of the S3 browser panels.
 */
export const initialS3BrowserPanelsState: S3BrowserPanelsState = {
  panels: {
    [S3BrowserPanels.RightPanel]: {
      panelName: S3BrowserPanels.RightPanel,
      size: 0,
    },
    [S3BrowserPanels.MiddlePanel]: {
      panelName: S3BrowserPanels.MiddlePanel,
      size: 0,
    },
    [S3BrowserPanels.LeftPanel]: {
      panelName: S3BrowserPanels.LeftPanel,
      size: 0,
    },
  },
};

/**
 * Factory function to create the S3 browser panels slice.
 *
 * This function initializes the state and provides actions to manage the S3 browser panels.
 *
 * @param {Function} set - Zustand's `set` function to update the state.
 * @param {Function} get - Zustand's `get` function to retrieve the current state.
 * @returns {S3BrowserPanelsSlice} The S3 browser panels slice containing state and actions.
 */
export const createS3BrowserPanelsSlice: StateCreator<
  S3BrowserPanelsSlice,
  [],
  [],
  S3BrowserPanelsSlice
> = (set, get) => ({
  ...initialS3BrowserPanelsState,

  setPanelSize: (panelName, size) =>
    set((state) => ({
      panels: {
        ...state.panels,
        [panelName]: { ...state.panels[panelName], size },
      },
    })),

  resetPanelSize: (panelName) =>
    set((state) => ({
      panels: {
        ...state.panels,
        [panelName]: { ...state.panels[panelName], size: 0 },
      },
    })),

  getPanelSize: (panelName) => {
    const panel = get().panels[panelName];
    return panel ? panel.size : 0;
  },
});
