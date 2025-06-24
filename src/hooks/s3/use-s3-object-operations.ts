'use client';
import {
  copyS3DirectoryAction,
  copyS3ObjectAction,
  createS3FolderAction,
  deleteS3DirectoryAction,
  deleteS3ObjectAction,
  moveS3DirectoryAction,
  moveS3ObjectAction,
  renameS3DirectoryAction,
  renameS3ObjectAction,
} from '@/actions/s3-actions';
import {useAppStore} from '@/context/app-store-provider';
import {useS3Navigation} from '@/hooks/s3';
import {FileOperationType} from '@/lib/enums';
import {OperationResult} from '@/lib/responses/operation-result';
import {S3ObjectType} from '@/lib/s3';
import {convertSourceKeyToDestinationKey, renameDestinationKey,} from '@/lib/s3/s3-helpers';
import {useCallback} from 'react';
import {useShallow} from 'zustand/react/shallow';

/**
 * Custom hook to manage S3 object operations such as creating, moving, copying, renaming, and deleting objects or directories.
 *
 * This hook provides state management and utility functions to perform various S3 operations.
 */
export default function useS3ObjectOperations() {
  const {
    // State
    s3Objects,
    sourceKey,
    operationType,
    operationMessage,
    selectedS3Object,
    selectedS3ObjectCleanUrl,
    // Actions
    setSourceKey,
    setOperationType,
    resetFileOperation,
    setOperationMessage,
    setS3Objects,
    setSelectedS3Object,
    setShowSelectedS3ObjectDetails,
    getObjectFromKey,
  } = useAppStore(
    useShallow((state) => ({
      // State
      s3Objects: state.s3Objects,
      sourceKey: state.sourceKey,
      operationType: state.operationType,
      operationMessage: state.operationMessage,
      selectedS3Object: state.selectedS3Object,
      selectedS3ObjectCleanUrl: state.selectedS3ObjectCleanUrl,
      // Actions
      setSourceKey: state.setSourceKey,
      setOperationType: state.setOperationType,
      resetFileOperation: state.resetFileOperation,
      setOperationMessage: state.setOperationMessage,
      setS3Objects: state.setS3Objects,
      setSelectedS3Object: state.setSelectedS3Object,
      setShowSelectedS3ObjectDetails: state.setShowSelectedS3ObjectDetails,
      getObjectFromKey: state.getObjectFromKey,
    }))
  );

  // Hooks
  const { getPath, getS3Objects } = useS3Navigation();

  /**
   * Creates a new directory in an S3 storage bucket.
   *
   * @param {string} newName - The name of the new directory to be created.
   *                            This value must be non-empty.
   * @returns {Promise<OperationResult<boolean>>} A promise resolving to an OperationResult object.
   *                                              The result indicates the success or failure of the operation.
   *
   * @throws {Error} If the operation type is not set to CREATE, the function will reject the operation
   *                 with an appropriate failure message and error details.
   */
  const createS3Directory = async (
    newName: string
  ): Promise<OperationResult<boolean>> => {
    if (operationType !== FileOperationType.CREATE) {
      return OperationResult.Failure<boolean>(
        'Invalid operation type for create operation',
        new Error('Expected CREATE operation type')
      );
    }

    if (!newName) {
      return OperationResult.Failure<boolean>('New name cannot be empty');
    }

    updateProcessingState(FileOperationType.CREATE);

    return validateAndDispatchS3Action(FileOperationType.CREATE, newName);
  };

  /**
   * Sets the source key for the current operation and the associated operation type.
   *
   * @param {string} key - The source key to be set. Must not be an empty string.
   * @param {FileOperationType} operationType - The type of file operation to be associated with the source key.
   * @returns {OperationResult<boolean>} A success result if the key is valid and the updates are made,
   * or a failure result with an error message if the key is empty.
   */
  const setOperationContext = useCallback(
    (
      key: string,
      operationType: FileOperationType
    ): OperationResult<boolean> => {
      if (!key) {
        return OperationResult.Failure<boolean>('Key cannot be empty');
      }
      setSourceKey(key);
      setOperationType(operationType);
      return OperationResult.Success(true);
    },
    [setSourceKey, setOperationType]
  );

  /**
   * Asynchronous function to move an object within Amazon S3.
   *
   * @returns {Promise<OperationResult<boolean>>} A promise that resolves
   * with the outcome of the operation, either indicating success or failure.
   */
  const moveS3Object = async (): Promise<OperationResult<boolean>> => {
    if (operationType !== FileOperationType.MOVE) {
      return OperationResult.Failure<boolean>(
        'Opoeration type is not set to MOVE',
        new Error('Expected MOVE operation type')
      );
    }
    updateProcessingState(FileOperationType.MOVE);
    return validateAndDispatchS3Action(FileOperationType.MOVE);
  };

  /**
   * Asynchronous function to copy an object within Amazon S3.
   *
   * @returns {Promise<OperationResult<boolean>>} A promise that resolves
   * with the outcome of the operation, either indicating success or failure.
   */
  const copyS3Object = async (): Promise<OperationResult<boolean>> => {
    if (operationType !== FileOperationType.COPY) {
      return OperationResult.Failure<boolean>(
        'Operation type is not set to COPY',
        new Error('Expected COPY operation type')
      );
    }
    updateProcessingState(FileOperationType.COPY);
    return validateAndDispatchS3Action(FileOperationType.COPY);
  };

  /**
   * Asynchronously deletes an object from an S3 storage bucket.
   *
   * @returns {Promise<OperationResult<boolean>>} A promise that resolves to an `OperationResult` which indicates success or failure of the operation.
   *
   * If the s3ObjectType is `DIRECTORY`, the associated S3 directory is deleted using `deleteS3DirectoryAction` before cleaning up the object locally.
   * If the s3ObjectType is `FILE`, the associated S3 file is deleted using `deleteS3ObjectAction` with a cleanup step performed after.
   * Handles any errors during the process and returns a failure result if encountered.
   */
  const deleteS3Object = async (): Promise<OperationResult<boolean>> => {
    if (operationType !== FileOperationType.DELETE) {
      return OperationResult.Failure<boolean>(
        'Operation type is not set to DELETE',
        new Error('Expected DELETE operation type')
      );
    }

    updateProcessingState(FileOperationType.DELETE);

    return validateAndDispatchS3Action(FileOperationType.DELETE);
  };

  /**
   * Handles renaming an S3 object or directory.
   *
   * @param {string} newName - The new name for the object
   * @returns {Promise<OperationResult<boolean>>} Result of the rename operation
   */
  const renameS3Object = async (
    newName: string
  ): Promise<OperationResult<boolean>> => {
    if (operationType !== FileOperationType.RENAME) {
      return OperationResult.Failure<boolean>(
        'Operation type is not set to RENAME',
        new Error('Expected RENAME operation type')
      );
    }

    updateProcessingState(FileOperationType.RENAME);

    return validateAndDispatchS3Action(FileOperationType.RENAME, newName);
  };

  /**
   * Validates input parameters and executes an S3 operation based on the specified operation type.
   *
   * @param {FileOperationType} operationType - The type of file operation to perform (e.g., copy, move, delete).
   * @param {string} [newName] - (Optional) A new name to be applied to the destination key if provided.
   *
   * @returns {Promise<OperationResult<boolean>>} - A promise that resolves to the result of the operation, indicating success or failure.
   *    On failure, includes an error message and details.
   *
   * @throws {Error} - Throws an error if either the `operationType` or `sourceKey` is not provided.
   *
   * @remarks
   * - Ensures that both `sourceKey` and `operationType` are provided before attempting the operation.
   * - Automatically sets the destination path to `'/'` if the computed path is an empty string.
   * - Converts the source key to the appropriate destination key, applying renaming if `newName` is provided.
   * - Determines if the source key refers to a directory or a file based on its structure.
   * - Delegates the actual S3 action execution to the `dispatchS3Action` function.
   */
  const validateAndDispatchS3Action = async (
    operationType: FileOperationType,
    newName?: string
  ): Promise<OperationResult<boolean>> => {
    // Get the source key from the store
    if (!sourceKey || !operationType) {
      const message = `Missing required parameters for ${operationType.toLowerCase()} operation, sourcekey, operationType`;
      return OperationResult.Failure<boolean>(message, new Error(message));
    }

    // Check if the destination key is a directory or a file
    let objectType = sourceKey.endsWith('/')
      ? S3ObjectType.DIRECTORY
      : S3ObjectType.FILE;

    // Bypass any other operation if operationType is DELETE
    if (operationType === FileOperationType.DELETE) {
      return await dispatchS3Action(operationType, objectType, sourceKey, '');
    }

    // Make the path / if it results in an empty string
    const destinationKey = getPath() === '' ? '/' : getPath();

    // Convert the source key to the destination key
    let destination = convertSourceKeyToDestinationKey(
      sourceKey,
      destinationKey
    );

    // If a new name is provided, rename the destination key
    if (newName && newName !== '') {
      // If a new name is provided, rename the destination key
      destination = renameDestinationKey(destination, newName);
    }

    // Overwrite object type to folder if the operation is CREATE
    if (operationType === FileOperationType.CREATE) {
      console.log(destination);
      objectType = S3ObjectType.DIRECTORY;
      if (!destination.endsWith('/')) {
        // If the destination is a file, append a slash to the end
        destination = `${destination}/`;
      }
    }

    return await dispatchS3Action(
      operationType,
      objectType,
      sourceKey,
      destination
    );
  };

  /**
   * Handles S3 file or directory operations such as move, copy, or rename based on the specified operation type and object type.
   *
   * @param {FileOperationType} operationType - The type of operation to perform (e.g., MOVE, COPY, RENAME).
   * @param {S3ObjectType} objectType - The type of S3 object (e.g., FILE or DIRECTORY) to operate on.
   * @param {string} sourceKey - The source key or path of the file or directory in the S3 bucket.
   * @param {string} destination - The destination path or key where the object will be moved, copied, or renamed to.
   * @returns {Promise<OperationResult<boolean>>} A promise that resolves with an `OperationResult` indicating
   * whether the operation succeeded or failed.
   */
  const dispatchS3Action = async (
    operationType: FileOperationType,
    objectType: S3ObjectType,
    sourceKey: string,
    destination: string
  ): Promise<OperationResult<boolean>> => {
    let response: OperationResult<boolean>;

    // Use a switch statement to handle different combinations of operation and object types
    switch (true) {
      // Create operations
      case operationType === FileOperationType.CREATE &&
        objectType === S3ObjectType.DIRECTORY:
        response = await createS3FolderAction(destination);
        break;
      // Move operations
      case operationType === FileOperationType.MOVE &&
        objectType === S3ObjectType.FILE:
        response = await moveS3ObjectAction(sourceKey, destination);
        break;

      case operationType === FileOperationType.MOVE &&
        objectType === S3ObjectType.DIRECTORY:
        response = await moveS3DirectoryAction(sourceKey, destination);
        break;

      // Copy operations
      case operationType === FileOperationType.COPY &&
        objectType === S3ObjectType.FILE:
        response = await copyS3ObjectAction(sourceKey, destination);
        break;

      case operationType === FileOperationType.COPY &&
        objectType === S3ObjectType.DIRECTORY:
        response = await copyS3DirectoryAction(sourceKey, destination);
        break;

      // Rename operations
      case operationType === FileOperationType.RENAME &&
        objectType === S3ObjectType.FILE:
        response = await renameS3ObjectAction(sourceKey, destination);
        break;

      case operationType === FileOperationType.RENAME &&
        objectType === S3ObjectType.DIRECTORY:
        response = await renameS3DirectoryAction(sourceKey, destination);
        break;

      // Delete operations
      case operationType === FileOperationType.DELETE &&
        objectType === S3ObjectType.FILE:
        response = await deleteS3ObjectAction(sourceKey);
        break;

      case operationType === FileOperationType.DELETE &&
        objectType === S3ObjectType.DIRECTORY:
        response = await deleteS3DirectoryAction(sourceKey);
        break;

      default:
        return OperationResult.Failure('Invalid operation or file type');
    }

    //const response = await actionFn(sourceKey, destination);
    if (response.success) {
      // Refresh the S3 objects in the current path
      await getS3Objects(getPath());
      // Check if the operation was successful
      resetFileOperation();
    }

    return response;
  };

  /**
   * Updates the processing state with the provided information.
   *
   * @param {FileOperationType|null} [operation] - An optional parameter specifying the type of file operation being performed. Defaults to null if not provided.
   * @param {string|null} [message] - An optional message associated with the current processing state. If not provided, a default message will be generated based on the operation type.
   */
  const updateProcessingState = (
    operation?: FileOperationType | null,
    message?: string | null
  ) => {
    setOperationMessage(message || getDefaultMessage(operation));
  };

  /**
   * Retrieves the default message associated with a given file operation type.
   *
   * @param {FileOperationType | null} operation - The type of file operation being performed. If null, no operation is provided.
   * @returns {string | null} The corresponding default message for the specified operation type.
   * Returns null if no operation is provided.
   */
  const getDefaultMessage = (
    operation: FileOperationType | null | undefined
  ): string => {
    switch (operation) {
      case FileOperationType.MOVE:
        return 'Moving S3 object...';
      case FileOperationType.COPY:
        return 'Copying S3 object...';
      case FileOperationType.DELETE:
        return 'Deleting S3 object...';
      case FileOperationType.RENAME:
        return 'Renaming S3 object...';
      case FileOperationType.CREATE:
        return 'Creating S3 directory...';
      default:
        return 'Processing S3 operation...';
    }
  };

  return {
    operationMessage,
    s3Objects,
    sourceKey,
    operationType,
    selectedS3Object,
    selectedS3ObjectCleanUrl,
    resetFileOperation,
    createS3Directory,
    setOperationContext,
    moveS3Object,
    copyS3Object,
    deleteS3Object,
    renameS3Object,
    setS3Objects,
    setSelectedS3Object,
    setShowSelectedS3ObjectDetails,
    getObjectFromKey,
    setSourceKey,
    setOperationType,
  };
}
