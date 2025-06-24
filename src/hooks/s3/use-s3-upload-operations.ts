'use client';
import {getUploadPresignedUrlAction} from '@/actions/s3-actions';
import useS3Navigation from '@/hooks/s3/use-s3-navigation';
import {s3UploadLimit} from '@/lib/configuration/config-provider';
import {readableFileSize} from '@/lib/file-utilities';
import logger from '@/lib/logging/logger';
import {OperationResult} from '@/lib/responses/operation-result';
import {S3Responses} from '@/lib/responses/s3-responses';
import axios from 'axios';
import {useCallback, useEffect, useRef, useState} from 'react';

export type FileUploadStatus = {
  /**
   * The file being uploaded.
   */
  file: File;

  /**
   * The progress of the file upload as a percentage.
   */
  progress: number;

  /**
   * The current status of the file upload.
   */
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';

  /**
   * An optional error message if the upload fails.
   */
  error?: string;
};

type UploadDetails = {
  /**
   * The location of the file in the S3 bucket.
   */
  location: string;

  /**
   * The presigned URL for uploading the file.
   */
  signedUrl: string;

  /**
   * The AbortController for managing upload cancellation.
   */
  controller: AbortController;
};

/**
 * Custom hook to manage S3 file uploads.
 *
 * This hook provides functionality for uploading files to S3, including
 * - Managing file upload states.
 * - Handling progress tracking and cancellation.
 * - Validating file sizes against upload limits.
 */
export default function useS3UploadOperations() {
  const { getPath, updateS3Objects } = useS3Navigation();

  // State management
  const [files, setFiles] = useState<File[]>([]);
  const [fileStatuses, setFileStatuses] = useState<FileUploadStatus[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(-1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [fileNameExist, setFileNameExist] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  // Upload cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update progress for the current file in batch uploads
  useEffect(() => {
    if (currentFileIndex >= 0 && currentFileIndex < fileStatuses.length) {
      setFileStatuses((prev) =>
        updateFileStatus(prev, currentFileIndex, { progress: progress })
      );
    }
  }, [progress, currentFileIndex, fileStatuses.length]);

  /**
   * Create an AbortController for managing upload cancellation.
   *
   * @returns {AbortController} The created AbortController instance.
   */
  const createAbortController = (): AbortController => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller;
  };

  /**
   * Reset all state variables to their initial values.
   */
  const resetState = useCallback(() => {
    setIsSubmitting(false);
    setFiles([]);
    setFileStatuses([]);
    setCurrentFileIndex(-1);
    setCurrentFile(null);
    setProgress(0);
    setFileNameExist(false);
  }, []);

  /**
   * Error handling
   * @param error error object
   * @param defaultMessage default error message
   * @return string error message
   */
  const handleError = (
    error: unknown,
    defaultMessage = 'Unknown error'
  ): string => {
    if (axios.isCancel(error)) return 'Upload cancelled';
    if (axios.isAxiosError(error)) return error.message;
    const message = error instanceof Error ? error.message : defaultMessage;
    logger.error(message);
    return message;
  };

  /**
   * Prepare upload by getting presigned URL
   * @param file the file to upload
   * @param overwrite whether to overwrite the existing file based on the file name
   * @return Promise<OperationResult<UploadDetails>>
   */
  const prepareUpload = async (
    file: File,
    overwrite: boolean
  ): Promise<OperationResult<UploadDetails>> => {
    const path = getPath();
    const currentLocation = path.endsWith('/') ? path : `${path}/`.trim();
    const location = currentLocation + file.name;

    const response = await getUploadPresignedUrlAction(location, overwrite);

    if (!response.success || !response.data) {
      setFileNameExist(response === S3Responses.FileNameExists);
      return OperationResult.ConvertFailure(response);
    }

    return OperationResult.Success<UploadDetails>({
      location,
      signedUrl: response.data,
      controller: createAbortController(),
    });
  };

  /**
   * Perform the upload with progress tracking
   * @param file the file to upload
   * @param signedUrl the presigned URL for the upload
   * @param controller the AbortController to manage cancellation
   * @return Promise<boolean> true if upload succeeded, false otherwise
   */
  const performUpload = async (
    file: File,
    signedUrl: string,
    controller: AbortController
  ) => {
    try {
      await axios.put(signedUrl, file, {
        headers: { 'Content-Type': file.type },
        signal: controller.signal,
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || 1;
          const percentComplete = Math.round(
            (progressEvent.loaded / total) * 100
          );
          setProgress(percentComplete);
        },
      });
      return true;
    } catch (error) {
      handleError(error);
    } finally {
      abortControllerRef.current = null;
      setFileNameExist(false);
    }
  };

  /**
   * Upload a single file
   * @param file the file to upload
   * @param overwrite whether to overwrite the existing file based on the file name
   * @return Promise<OperationResult<boolean>>
   */
  const uploadSingleFile = async (
    file: File,
    overwrite = false
  ): Promise<OperationResult<boolean>> => {
    setCurrentFile(file);

    try {
      const uploadResult = await prepareUpload(file, overwrite);

      if (!uploadResult || !uploadResult.success) {
        return OperationResult.ConvertFailure(uploadResult);
      }

      if (
        !uploadResult.data ||
        !uploadResult.data.signedUrl ||
        !uploadResult.data.controller
      ) {
        return OperationResult.ConvertFailure(uploadResult);
      }

      const uploadSuccess = await performUpload(
        file,
        uploadResult.data.signedUrl,
        uploadResult.data.controller
      );

      if (uploadSuccess) {
        setProgress(0);
        await updateS3Objects(getPath());
        setCurrentFile(null);
        return OperationResult.Success(true);
      }

      return OperationResult.Failure('Upload failed');
    } catch (error) {
      return OperationResult.Failure(`Upload error: ${handleError(error)}`);
    }
  };

  /**
   * Upload multiple files sequentially
   * @param overwrite whether to overwrite existing files with the same name
   * @return Promise<{ successCount: number; errorCount: number }>
   */
  const uploadMultipleFiles = async (overwrite = false) => {
    if (files.length === 0) return { successCount: 0, errorCount: 0 };

    setIsSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        // Skip files that are already completed or cancelled
        if (
          fileStatuses[i].status === 'completed' ||
          fileStatuses[i].status === 'cancelled'
        ) {
          continue;
        }

        // Reset progress for the current file
        setCurrentFileIndex(i);
        setFileStatuses((prev) =>
          updateFileStatus(prev, i, { status: 'uploading' })
        );

        // Upload the file
        const result = await uploadSingleFile(files[i], overwrite);

        // Handle the result of the upload
        setFileStatuses((prev) => {
          if (!result.success) {
            errorCount++;
            return updateFileStatus(prev, i, {
              status: 'error',
              error: result.message,
            });
          }

          successCount++;
          return updateFileStatus(prev, i, {
            progress: 100,
            status: 'completed',
          });
        });
      }
    } finally {
      // Reset state after all uploads are done
      setCurrentFileIndex(-1);
      setIsSubmitting(false);
      await updateS3Objects(getPath());
    }

    return { successCount, errorCount };
  };

  /**
   * Update a file status in the file statuses array
   * @param prevStatuses Current file statuses array
   * @param index Index of the file to update
   * @param statusUpdate Object containing status updates
   * @returns Updated file statuses array
   */
  const updateFileStatus = (
    prevStatuses: FileUploadStatus[],
    index: number,
    statusUpdate: Partial<Omit<FileUploadStatus, 'file'>>
  ): FileUploadStatus[] => {
    const updated = [...prevStatuses];
    updated[index] = { ...updated[index], ...statusUpdate };
    return updated;
  };

  /**
   * Set files and prepare statuses
   * @param newFiles
   */
  const handleFiles = (newFiles: File[]) => {
    setFiles(newFiles);
    setFileStatuses(
      newFiles.map((file) => ({
        file,
        progress: 0,
        status: 'pending',
      }))
    );
  };

  /**
   * Cancel current upload
   */
  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setProgress(0);
    }
  };

  /**
   * Cancel all uploads
   */
  const cancelAllUploads = () => {
    cancelUpload();
    setFileStatuses((prev) => {
      let updated = [...prev];

      for (let i = 0; i < updated.length; i++) {
        if (
          updated[i].status === 'uploading' ||
          updated[i].status === 'pending'
        ) {
          updated = updateFileStatus(updated, i, { status: 'cancelled' });
        }
      }

      return updated;
    });
    setCurrentFileIndex(-1);
  };

  /**
   *  Validate the files exist and check if the size limit has been set
   *  @return Promise<OperationResult<boolean>>
   */
  const validateFiles = async (): Promise<OperationResult<boolean>> => {
    if (files.length === 0) {
      return OperationResult.Failure('Please select at least one file');
    }

    const uploadLimit = await s3UploadLimit();
    if (uploadLimit) {
      const oversizedFiles = files.filter((file) => file.size > uploadLimit);
      if (oversizedFiles.length > 0) {
        return OperationResult.Failure(
          `${oversizedFiles.length} file(s) exceed the maximum allowed size (${readableFileSize(uploadLimit)})`
        );
      }
    }

    return OperationResult.Success();
  };

  return {
    // State
    files,
    fileStatuses,
    currentFileIndex,
    currentFile,
    isSubmitting,
    overwriteExisting,
    progress,
    fileNameExist: fileNameExist,

    // Setters
    setFiles: handleFiles,
    setOverwriteExisting,

    // Actions
    uploadSingleFile,
    uploadMultipleFiles,
    cancelUpload,
    cancelAllUploads,
    resetState,
    validateFiles,
  };
}
