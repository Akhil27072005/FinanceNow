import { useEffect, useState } from 'react';

const QUERIES = {
  xs: '(max-width: 479px)',
  sm: '(max-width: 639px)',
  md: '(max-width: 767px)',
  lg: '(max-width: 1023px)',
  xl: '(max-width: 1279px)'
};

const getBreakpointState = () => {
  if (typeof window === 'undefined') {
    return {
      width: 1280,
      isXs: false,
      isSm: false,
      isMd: false,
      isLg: false,
      isXl: false,
      isMobile: false
    };
  }

  const width = window.innerWidth;

  return {
    width,
    isXs: width <= 479,
    isSm: width <= 639,
    isMd: width <= 767,
    isLg: width <= 1023,
    isXl: width <= 1279,
    isMobile: width <= 767
  };
};

/**
 * Viewport breakpoint state — debounced on resize.
 */
export const useBreakpoint = () => {
  const [state, setState] = useState(getBreakpointState);

  useEffect(() => {
    let timeoutId;

    const update = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setState(getBreakpointState());
      }, 100);
    };

    update();

    const mediaLists = Object.values(QUERIES).map((query) => window.matchMedia(query));
    mediaLists.forEach((mql) => mql.addEventListener('change', update));
    window.addEventListener('resize', update);

    return () => {
      clearTimeout(timeoutId);
      mediaLists.forEach((mql) => mql.removeEventListener('change', update));
      window.removeEventListener('resize', update);
    };
  }, []);

  return state;
};

export default useBreakpoint;
