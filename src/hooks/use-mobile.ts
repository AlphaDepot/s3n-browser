import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Custom hook to determine if the current viewport width is considered mobile.
 *
 * This hook listens for changes in the viewport width and updates its state
 * accordingly. It uses a breakpoint of 768px to classify mobile devices.
 *
 * @returns {boolean} `true` if the viewport width is less than the mobile breakpoint, otherwise `false`.
 */
export function useIsMobile() {
  // State to store whether the viewport is mobile or not.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    // Create a MediaQueryList object to monitor changes to the viewport width.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    // Handler to update the state when the viewport width changes.
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Add the event listener for changes in the media query.
    mql.addEventListener('change', onChange);

    // Set the initial state based on the current viewport width.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Cleanup function to remove the event listener when the component unmounts.
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Return the state, ensuring it is always a boolean.
  return !!isMobile;
}
