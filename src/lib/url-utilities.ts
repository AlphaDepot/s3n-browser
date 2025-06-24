import configProvider from '@/lib/configuration/config-provider';
import logger from '@/lib/logging/logger';

/**
 * Replaces the domain of a given URL with a new domain.
 * @param url - The original URL.
 * @param newDomain - The new domain to replace the original domain with.
 * @returns The URL with the new domain.
 */
const replaceDomain = (url: string, newDomain: string): string => {
  const parsedUrl = new URL(url);
  return `${newDomain}${parsedUrl.pathname}`;
};

/**
 * Converts a key to a signing service URL.
 * @param key - The key to convert.
 * @returns The signing service URL or null if the URL could not be constructed.
 */
const keyToSigningServiceUrl = async (key: string) => {
  const apiUrl = await configProvider();
  if (!apiUrl) {
    logger.error('Could not get signing service url');
    return null;
  }

  // Make key safe by encoding it
  const safeKey = key.trim();

  // Normalize the URL joining by removing any trailing/leading slashes
  const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  const keyPath = safeKey.startsWith('/') ? safeKey : `/${safeKey}`;

  return `${baseUrl}${keyPath}`;
};

export { replaceDomain, keyToSigningServiceUrl };
