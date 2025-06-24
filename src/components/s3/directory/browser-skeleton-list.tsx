import React from 'react';
import FileSkeleton from '@/components/s3/files/file-skeleton';

function BrowserSkeletonList() {
  const numberOfSkeletons = 10; // Adjust the number of skeletons as needed
  const skeletons = Array.from({ length: numberOfSkeletons }, (_, index) => (
    <FileSkeleton key={index} />
  ));

  return <div className='flex flex-wrap gap-4 p-4'>{skeletons}</div>;
}

export default BrowserSkeletonList;
