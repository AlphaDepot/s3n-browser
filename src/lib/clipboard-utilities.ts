import logger from '@/lib/logging/logger';

/**
 *  Utility function to save text to the clipboard.
 * @param text
 * @param successCallback
 * @param errorCallback
 */
export default function saveToClipboard(
  text: string,
  successCallback?: () => void,
  errorCallback?: (err: Error) => void
) {
  if (!navigator.clipboard) {
    console.warn('Clipboard API not supported');
    return;
  }
  navigator.clipboard.writeText(text).then(
    () => {
      if (successCallback) {
        successCallback();
      }
    },
    (err) => {
      if (errorCallback) {
        errorCallback(err);
      }

      logger.error('Could not copy text: ', err);
    }
  );
}
