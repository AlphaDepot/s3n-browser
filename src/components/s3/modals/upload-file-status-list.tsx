import {Progress} from '@/components/ui/progress';
import React, {JSX} from 'react';
import {readableFileSize} from '@/lib/file-utilities';
import {FileUploadStatus} from '@/hooks/s3/use-s3-upload-operations';

interface UploadFileStatusListProps {
  fileStatuses: FileUploadStatus[];
}

/**
 * Component to display the status of uploaded files.
 * @param fileStatuses
 * @constructor
 */
function UploadFileStatusList({
  fileStatuses,
}: UploadFileStatusListProps): JSX.Element {
  return (
    <div>
      {fileStatuses.map((status, index) => (
        <div key={index} className='mb-2 last:mb-0'>
          <div className='mb-1 flex items-center justify-between'>
            <span
              className='max-w-[300px] truncate text-sm'
              title={status.file.name}
            >
              {status.file.name} ({readableFileSize(status.file.size)})
            </span>
            <span className='ml-2 text-xs'>
              {status.status === 'pending' && 'Pending'}
              {status.status === 'uploading' &&
                `${status.progress.toFixed(0)}%`}
              {status.status === 'completed' && 'Completed'}
              {status.status === 'error' && 'Failed'}
              {status.status === 'cancelled' && 'Cancelled'}
            </span>
          </div>

          {status.status === 'uploading' && (
            <Progress value={status.progress} className='h-1' />
          )}
          {status.status === 'completed' && (
            <Progress value={100} className='h-1 bg-green-100' />
          )}
          {status.status === 'error' && (
            <div>
              <Progress value={100} className='h-1 bg-red-100' />
              {status.error && (
                <p className='mt-1 text-xs text-red-500'>{status.error}</p>
              )}
            </div>
          )}
          {status.status === 'cancelled' && (
            <Progress value={100} className='h-1 bg-amber-100' />
          )}
        </div>
      ))}
    </div>
  );
}

export default UploadFileStatusList;
