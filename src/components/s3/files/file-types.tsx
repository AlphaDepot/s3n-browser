'use client';
import { JSX, ReactElement } from 'react';
import {
  BsDiscFill,
  BsFilePdf,
  BsFiletypeExe,
  BsFileZipFill,
} from 'react-icons/bs';
import { LuFileText } from 'react-icons/lu';
import {
  RiFileExcel2Fill,
  RiFilePpt2Fill,
  RiFileWord2Fill,
} from 'react-icons/ri';

interface Files {
  /**
   * A mapping of file types to their corresponding React elements (icons).
   * The key is the file type (e.g., 'txt', 'pdf'), and the value is the icon component.
   */
  [key: string]: ReactElement;
}

interface FileTypesProps {
  /**
   * The type of the file, used to determine the appropriate icon.
   */
  type: string;

  /**
   * The size of the icon to be displayed (optional).
   * Defaults to 64 if not provided.
   */
  size?: number;
}

/**
 * List of supported file types for which icons are available.
 * For `fileIcons` to work, the extension must also exist in this list.
 */
export const FILE_TYPES = [
  'txt',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'csv',
  'ppt',
  'pptx',
  'zip',
  '7z',
  'rar',
  'tar',
  'gz',
  'bz2',
  'xz',
  'exe',
  'iso',
];
/**
 * Retrieves the appropriate file icon based on the file type.
 *
 * @param {string} type - The file type (e.g., 'pdf', 'docx').
 * @param {number} [size=64] - The size of the icon (optional, defaults to 64).
 * @returns {ReactElement} The React element representing the file icon.
 */
function getFileIcon(type: string, size: number = 64): ReactElement {
  const fileIcons: Files = {
    default: <LuFileText size={size} />,
    txt: <LuFileText size={size} />,
    pdf: <BsFilePdf size={size} />,
    doc: <RiFileWord2Fill size={size} />,
    docx: <RiFileWord2Fill size={size} />,
    xls: <RiFileExcel2Fill size={size} />,
    xlsx: <RiFileExcel2Fill size={size} />,
    csv: <RiFileExcel2Fill size={size} />,
    ppt: <RiFilePpt2Fill size={size} />,
    pptx: <RiFilePpt2Fill size={size} />,
    zip: <BsFileZipFill size={size} />,
    '7z': <BsFileZipFill size={size} />,
    rar: <BsFileZipFill size={size} />,
    tar: <BsFileZipFill size={size} />,
    gz: <BsFileZipFill size={size} />,
    bz2: <BsFileZipFill size={size} />,
    xz: <BsFileZipFill size={size} />,
    exe: <BsFiletypeExe size={size} />,
    iso: <BsDiscFill size={size} />,
  };

  return fileIcons[type] || fileIcons['default'];
}
/**
 * Component for rendering a file icon based on the file type.
 *
 * This component uses the `getFileIcon` function to determine the appropriate
 * icon for the given file type and size.
 *
 * @param {FileTypesProps} props - The properties for the component.
 * @returns {ReactElement} The rendered file icon component.
 */
export default function FileTypes({ type, size }: FileTypesProps): JSX.Element {
  return getFileIcon(type, size);
}
