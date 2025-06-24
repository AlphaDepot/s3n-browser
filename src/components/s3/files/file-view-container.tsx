import FileContextMenu from '@/components/s3/files/file-context-menu';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ReactNode } from 'react';

interface FileViewContainerProps {
  /**
   * The content to be displayed inside the file view container.
   */
  view: ReactNode;

  /**
   * The title of the file or folder being displayed.
   */
  title: string;

  /**
   * The S3 object key associated with the file or folder (optional).
   */
  s3ObjectKey?: string;
}

/**
 * Component for rendering a container for file or folder views.
 *
 * This component provides a consistent layout for displaying files or folders
 * in the S3 browser. It includes a context menu, a card layout, and a footer
 * for displaying the title of the file or folder.
 *
 * @param {FileViewContainerProps} props - The properties for the file view container.
 */
export default function FileViewContainer({
  view,
  title,
  s3ObjectKey,
}: FileViewContainerProps) {
  return (
    <FileContextMenu s3ObjectKey={s3ObjectKey}>
      <Card
        className={`flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden py-2`}
      >
        <CardContent className='flex min-h-0 w-full flex-grow items-center justify-center overflow-hidden px-0'>
          {view}
        </CardContent>
        <CardFooter className='w-28 px-1'>
          <p className='truncate'>{title}</p>
        </CardFooter>
      </Card>
    </FileContextMenu>
  );
}
