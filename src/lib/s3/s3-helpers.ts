import { S3ObjectsSortBy, SortDirection } from '@/lib/enums';
import { S3Object, S3ObjectType } from '@/lib/s3/s3-types';
import { ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';

/**
 * Splits the prefix name and returns the second last part.
 * @param prefix
 */
export const handlePrefixNameSplit = (prefix: string): string => {
  const parts = prefix.split('/');
  if (parts.length >= 2) {
    return parts[parts.length - 2];
  } else {
    return parts[0];
  }
};

/**
 *  Converts the ListObjectsV2CommandOutput to an array of S3 objects.
 * @param response
 * @constructor
 */
export const ListObjectsV2CommandOutputToS3Object = (
  response: ListObjectsV2CommandOutput
): S3Object[] => {
  const s3Objects: S3Object[] = [];
  // check for common prefixes
  if (response?.CommonPrefixes) {
    response.CommonPrefixes.forEach((prefix) => {
      s3Objects.push({
        type: S3ObjectType.DIRECTORY,
        key: prefix.Prefix || '',
        name: handlePrefixNameSplit(prefix.Prefix || ''),
      });
    });
  }

  // check for files that ar not empty folders
  if (response.Contents) {
    response.Contents.forEach((object) => {
      // Skip the current directory entry (ends with /)
      if (object.Key === response.Prefix) {
        return;
      }
      // Check if the object is an empty directory that is a file with no extension
      // or if the object is a directory with a single trailing slash
      if (
        object?.Key?.split('.')[0] === object.Key ||
        object.Key?.endsWith('/')
      ) {
        s3Objects.push({
          type: S3ObjectType.DIRECTORY,
          key: object.Key || '',
          name: object.Key?.split('/').pop() || '',
        });
        return;
      }

      s3Objects.push({
        type: S3ObjectType.FILE,
        key: object.Key || '',
        object: object,
        name: object.Key?.split('/').pop() || '',
      });
    });
  }

  return s3Objects;
};

/**
 * Converts a source key to a destination key.
 * @param sourceKey
 * @param destinationKey
 */
export const convertSourceKeyToDestinationKey = (
  sourceKey: string,
  destinationKey: string
): string => {
  // Extract the last part of the source key (file or folder name)
  const sourceParts = sourceKey.split('/');
  let sourceName;

  // Check if the source key is a directory (ends with /)
  if (sourceKey.endsWith('/')) {
    // For directories (ending with /), take the last non-empty part
    sourceName = sourceParts[sourceParts.length - 2] || '';
    sourceName += '/'; // Keep the trailing slash for directories
  } else {
    // For files, take the last part
    sourceName = sourceParts[sourceParts.length - 1];
  }

  // Construct the destination path
  if (destinationKey.endsWith('/')) {
    // If destination is a directory, append the source name to it
    return destinationKey + sourceName;
  } else {
    // Otherwise, use the destination key as is (it already includes the filename)
    return destinationKey;
  }
};

/**
 * Rename the destination key based on the new name.
 * @param destinationKey
 * @param newName
 */
export const renameDestinationKey = (
  destinationKey: string,
  newName: string
): string => {
  // Check if the destination key is a directory (ends with /)
  if (destinationKey.endsWith('/')) {
    // For directories, replace the last part with the new name
    const parts = destinationKey.split('/').filter(Boolean); // Remove empty parts
    parts[parts.length - 1] = newName; // Replace the last non-empty part
    const result = '/' + parts.join('/');
    return result.endsWith('/') ? result : result + '/'; // Ensure it ends with a slash
  } else {
    // For files, just replace the last part with the new name
    const parts = destinationKey.split('/');
    parts[parts.length - 1] = newName; // Replace the last part
    return parts.join('/'); // No trailing slash for files
  }
};

/**
 * Sorts an array of S3 objects based on the specified criteria.
 * @param objects - The array of S3 objects to sort.
 * @param orderBy - The direction to sort (ascending or descending).
 * @param sortBy - The criteria to sort by (name, date, size, type).
 * @param reset - If true, resets the sorting to directories first, then files by name.
 * @returns A new array of sorted S3 objects.
 */
export const s3ObjectsSort = (
  objects: S3Object[],
  orderBy: SortDirection,
  sortBy: S3ObjectsSortBy,
  reset: boolean = false
): S3Object[] => {
  // Clone the array to avoid mutating the original
  const sortedObjects = [...objects];

  // If reset is true, separate directories and files, then sort by name
  if (reset) {
    // Separate directories and files
    const directories = sortedObjects.filter(
      (obj) => obj.type === S3ObjectType.DIRECTORY
    );
    const files = sortedObjects.filter((obj) => obj.type === S3ObjectType.FILE);

    // Sort both arrays by name
    directories.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));

    // Return directories on top, followed by files
    return [...directories, ...files];
  }

  // If Not reset, sort the objects based on the specified criteria
  // First sort directories to top regardless of other sorting
  sortedObjects.sort((a, b) => {
    // If both are the same type, sort according to specified criteria
    switch (sortBy) {
      case S3ObjectsSortBy.NAME:
        return a.name.localeCompare(b.name);
      case S3ObjectsSortBy.DATE:
        // If objects exist, compare by LastModified, otherwise by name
        if (
          a.object &&
          b.object &&
          a.object.LastModified &&
          b.object.LastModified
        ) {
          return (
            a.object.LastModified.getTime() - b.object.LastModified.getTime()
          );
        }
        // Directories or missing dates fall back to name sorting
        return a.name.localeCompare(b.name);
      case S3ObjectsSortBy.SIZE:
        // If objects exist, compare by Size, otherwise by name
        if (a.object && b.object) {
          return (a.object.Size || 0) - (b.object.Size || 0);
        }
        // Directories or missing sizes fall back to name sorting
        return a.name.localeCompare(b.name);

      case S3ObjectsSortBy.TYPE:
        // If both are the same type, sort according to specified criteria
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }
        // Sort directories before files
        return a.type === S3ObjectType.DIRECTORY ? -1 : 1;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Reverse the array if descending order is requested
  if (orderBy === SortDirection.DESC) {
    // Only reverse the files array, keeping directories at top
    return sortedObjects.reverse();
  }

  return sortedObjects;
};
