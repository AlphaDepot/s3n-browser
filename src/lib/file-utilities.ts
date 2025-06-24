import { FILE_TYPES } from '@/components/s3/files/file-types';
import { IMAGE_TYPES } from '@/components/s3/files/image-view';

/**
 * Interface representing the structure of file types.
 */
export interface FileTypes {
  /** The type of the file (e.g., document, video, etc.). */
  fileType: string;
  /** The type of the image (e.g., jpeg, png, etc.). */
  imageType: string;
  /** The file extension (e.g., .txt, .jpg, etc.). */
  fileExtension: string;
}

/**
 * Determines the file type, image type, and file extension based on the file name.
 *
 * @param {string} [fileName] - The name of the file to analyze.
 * @returns {FileTypes} An object containing the file type, image type, and file extension.
 */
export const getFileType = (fileName?: string): FileTypes => {
  if (!fileName) {
    return {
      fileType: '',
      imageType: '',
      fileExtension: '',
    };
  }

  const fileExtension = fileName.split('.').pop() || '';

  const fileType = FILE_TYPES.find((type) => fileName.includes(type)) || '';
  const imageType = IMAGE_TYPES.find((type) => fileName.includes(type)) || '';

  return {
    fileType: fileType,
    imageType: imageType,
    fileExtension: fileExtension,
  };
};

/**
 * Converts a file size in bytes to a human-readable string.
 *
 * @param {number} size - The size of the file in bytes.
 * @returns {string} The file size in a human-readable format (e.g., "1.23 MB").
 */
export const readableFileSize = (size: number): string => {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (size === 0) return '0 B';
  return parseFloat((size / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};
