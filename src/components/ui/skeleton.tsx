import { classMerger } from '@/lib/classes-utilities';
import { ComponentProps } from 'react';

function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='skeleton'
      className={classMerger('bg-accent animate-pulse rounded-md', className)}
      {...props}
    />
  );
}

export { Skeleton };
