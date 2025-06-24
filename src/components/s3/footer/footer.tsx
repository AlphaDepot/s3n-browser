import DirectoryBreadcrumb from '@/components/s3/directory/directory-breadcrumb';
import { ModeToggleDropdown } from '@/components/theme/mode-toggle-dropdown';

/**
 * Footer component for the S3 interface.
 * @constructor
 */
export default function Footer() {
  return (
    <div className='flex flex-nowrap justify-between border-t-2 p-1'>
      <div className='left flex max-w-[80vw] items-center'>
        <DirectoryBreadcrumb />
      </div>
      <div className='right flex max-w-[20vw] flex-nowrap gap-0.5'>
        <ModeToggleDropdown />
      </div>
    </div>
  );
}
