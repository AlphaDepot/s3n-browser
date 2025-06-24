/**
 * Enum representing the sort direction for sorting operations.
 */
export enum SortDirection {
  /** Sort in ascending order. */
  ASC = 'asc',
  /** Sort in descending order. */
  DESC = 'desc',
}

/**
 * Enum representing the fields by which S3 objects can be sorted.
 */
export enum S3ObjectsSortBy {
  /** Sort by the name of the object. */
  NAME = 'name',
  /** Sort by the size of the object. */
  SIZE = 'size',
  /** Sort by the date of the object. */
  DATE = 'date',
  /** Sort by the type of the object. */
  TYPE = 'type',
}

/**
 * Enum representing the types of file operations that can be performed.
 */
export enum FileOperationType {
  /** Rename a file. */
  RENAME = 'rename',
  /** Delete a file. */
  DELETE = 'delete',
  /** Copy a file. */
  COPY = 'copy',
  /** Move a file. */
  MOVE = 'move',
  /** Create a new file. */
  CREATE = 'create',
}

/**
 * Enum representing the different modals available in the application.
 */
export enum Modals {
  /** Modal for navigating to a directory. */
  GoToDirectory = 'GoToDirectory',
  /** Modal for uploading files. */
  Upload = 'Upload',
  /** Modal for uploading multiple files. */
  MultiUpload = 'MultiUpload',
  /** Modal for deleting files. */
  Delete = 'Delete',
  /** Modal for renaming files. */
  Rename = 'Rename',
  /** Modal for sharing files. */
  Share = 'Share',
  /** Modal for downloading files. */
  Download = 'Download',
  /** Modal for moving files. */
  Move = 'Move',
  /** Modal for copying files. */
  Copy = 'Copy',
  /** Modal for viewing file properties. */
  Properties = 'Properties',
  /** Modal for signing a URL. */
  SignUrl = 'SignUrl',
  /** Modal for creating a new folder. */
  CreateFolder = 'CreateFolder',
}

/**
 * Enum representing the panels in the S3 browser.
 */
export enum S3BrowserPanels {
  /** The right panel of the S3 browser. */
  RightPanel = 'RightPanel',
  /** The middle panel of the S3 browser. */
  MiddlePanel = 'MiddlePanel',
  /** The left panel of the S3 browser. */
  LeftPanel = 'LeftPanel',
}
