'use client';

import { classMerger } from '@/lib/classes-utilities';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as React from 'react';

function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot='separator-root'
      decorative={decorative}
      orientation={orientation}
      className={classMerger(
        'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className
      )}
      {...props}
    />
  );
}

export { Separator };
