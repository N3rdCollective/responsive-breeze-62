
import { useNavigate, NavigateOptions } from 'react-router-dom';
import { useCallback } from 'react';

export const useScrollToTopNavigation = () => {
  const navigate = useNavigate();

  const navigateWithScrollToTop = useCallback((to: string | number, options?: NavigateOptions) => {
    if (typeof to === 'string') {
      navigate(to, options);
      // Use setTimeout to ensure navigation completes before scrolling
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }, 0);
    } else {
      navigate(to);
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }, 0);
    }
  }, [navigate]);

  return navigateWithScrollToTop;
};
