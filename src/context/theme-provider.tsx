'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from 'react';
import { JSX } from 'react';

/**
 * ThemeProvider component.
 * Wraps the application with a Next.js theme provider, allowing child components
 * to access the theme context.
 *
 * @param children
 * @param {React.ComponentProps<typeof NextThemesProvider>} props - The props for the provider.
 * @returns {JSX.Element} The provider component wrapping its children.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>): JSX.Element {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
