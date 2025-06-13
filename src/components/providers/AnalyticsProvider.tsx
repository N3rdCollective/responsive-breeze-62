
import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalyticsTracking } from '@/hooks/useAnalyticsTracking';

interface AnalyticsContextType {
  trackPageView: (pagePath: string) => void;
  isAnalyticsEnabled: boolean;
  setAnalyticsEnabled: (enabled: boolean) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const location = useLocation();
  const { trackPageView, isAnalyticsEnabled, setAnalyticsEnabled } = useAnalyticsTracking();

  // Track page views on route changes
  useEffect(() => {
    const pagePath = location.pathname + location.search;
    trackPageView(pagePath);
  }, [location, trackPageView]);

  const value: AnalyticsContextType = {
    trackPageView,
    isAnalyticsEnabled,
    setAnalyticsEnabled
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
