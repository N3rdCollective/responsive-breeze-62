
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSecurityEventLogger } from '@/hooks/security/useSecurityEventLogger';

interface SecurityContextType {
  logSecurityEvent: (eventType: string, severity?: string, details?: any) => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const { logSecurityEvent } = useSecurityEventLogger();

  useEffect(() => {
    // Log page load events for security monitoring
    const handlePageLoad = () => {
      logSecurityEvent('page_access', 'low', {
        page: window.location.pathname,
        referrer: document.referrer
      });
    };

    // Log suspicious activities
    const handleContextMenu = (e: MouseEvent) => {
      // Log right-click attempts on sensitive pages
      if (window.location.pathname.includes('/staff/')) {
        logSecurityEvent('suspicious_activity', 'low', {
          action: 'right_click_on_staff_page',
          page: window.location.pathname
        });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Log developer tools access attempts
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        logSecurityEvent('suspicious_activity', 'low', {
          action: 'dev_tools_access_attempt',
          page: window.location.pathname
        });
      }
    };

    // Add event listeners
    window.addEventListener('load', handlePageLoad);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('load', handlePageLoad);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [logSecurityEvent]);

  const value: SecurityContextType = {
    logSecurityEvent
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
