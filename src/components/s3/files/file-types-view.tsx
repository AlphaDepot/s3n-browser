import FileTypes, { FILE_TYPES } from '@/components/s3/files/file-types';
import { S3Object } from '@/lib/s3';
import { FileText } from 'lucide-react';
import FileViewContainer from './file-view-container';
import { JSX } from 'react';

type FileViewProps = {
  /**
   * The S3 object representing the file to be displayed.
   */
  file: S3Object;
};
/**
 * Component for rendering a file view based on its type.
 *
 * This component determines the type of the file and displays an appropriate
 * view. If the file type is recognized, it uses the `FileTypes` component to
 * render the file. Otherwise, it falls back to a default file icon.
 *
 * @param {FileViewProps} props - The properties for the file view component.
 */
export default function FileTypesView({ file }: FileViewProps) {
  /**
   * Determines the file type and renders the appropriate view.
   *
   * If the file type is included in the predefined `FILE_TYPES`, it renders
   * the file using the `FileTypes` component. Otherwise, it displays a default
   * file icon.
   *
   * @param {S3Object} file - The S3 object representing the file.
   * @returns {JSX.Element} The rendered file view container.
   */
  const displayFileByType = (file: S3Object): JSX.Element => {
    if (FILE_TYPES.includes(file.name.split('.').pop() || '')) {
      const type =
        FILE_TYPES.find((type) => file.name.includes(type)) || 'default';

      return (
        <FileViewContainer
          view={<FileTypes type={type} />}
          title={file.name}
          s3ObjectKey={file.key}
        />
      );
    } else {
      return (
        <FileViewContainer
          view={<FileText size={64} />}
          title={file.name}
          s3ObjectKey={file.key}
        />
      );
    }
  };

  return <>{displayFileByType(file)}</>;
}
