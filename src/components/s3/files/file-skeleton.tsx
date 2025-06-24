import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function FileSkeleton() {
  return (
    <Card
      className={`flex h-32 w-32 cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden py-2`}
    >
      <CardContent className='flex min-h-0 w-full flex-grow items-center justify-center overflow-hidden px-0'>
        <Skeleton className='bg-secondary-foreground h-16 w-16 rounded-full' />
      </CardContent>
      <CardFooter className='w-28 px-1'>
        <Skeleton className='bg-secondary-foreground h-4 w-full' />
      </CardFooter>
    </Card>
  );
}

export default FileSkeleton;
