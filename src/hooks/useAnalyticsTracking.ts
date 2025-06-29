
import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { detectDevice, getOrCreateSessionId } from '@/utils/deviceDetection';
import { useAuth } from '@/hooks/useAuth';

interface AnalyticsEvent {
  page_path: string;
  referrer?: string;
  user_id?: string;
  session_id: string;
  device_info: any;
  timestamp: string;
}

export const useAnalyticsTracking = () => {
  const { user } = useAuth();
  const lastTrackedPage = useRef<string | null>(null);
  const lastDetectedDevice = useRef<string | null>(null);
  const trackingQueue = useRef<AnalyticsEvent[]>([]);
  const isProcessing = useRef(false);

  // Check if analytics is enabled (privacy setting)
  const isAnalyticsEnabled = useCallback(() => {
    const preference = localStorage.getItem('analytics_enabled');
    return preference !== 'false'; // Default to enabled
  }, []);

  // Process queued analytics events
  const processQueue = useCallback(async () => {
    if (isProcessing.current || trackingQueue.current.length === 0) {
      return;
    }

    isProcessing.current = true;
    const events = [...trackingQueue.current];
    trackingQueue.current = [];

    try {
      for (const event of events) {
        console.log('Analytics: Processing event for', event.page_path, 'with device:', event.device_info);
        
        const { error } = await supabase
          .from('analytics')
          .insert({
            page_path: event.page_path,
            referrer: event.referrer,
            user_id: event.user_id,
            session_id: event.session_id,
            device_info: event.device_info,
            created_at: event.timestamp
          });

        if (error) {
          console.error('Analytics tracking error:', error);
          // Re-queue failed events (with limit to prevent infinite loops)
          if (trackingQueue.current.length < 10) {
            trackingQueue.current.push(event);
          }
        } else {
          console.log('Analytics: Successfully tracked event');
        }
      }
    } catch (error) {
      console.error('Analytics processing error:', error);
    } finally {
      isProcessing.current = false;
    }
  }, []);

  // Track page view
  const trackPageView = useCallback(async (pagePath: string) => {
    if (!isAnalyticsEnabled()) {
      console.log('Analytics tracking disabled by user preference');
      return;
    }

    // Avoid duplicate tracking for the same page
    if (lastTrackedPage.current === pagePath) {
      return;
    }

    lastTrackedPage.current = pagePath;

    try {
      const deviceInfo = detectDevice();
      const deviceKey = `${deviceInfo.type}-${deviceInfo.browser}-${deviceInfo.os}`;
      
      // Force new session if device type changed (helps with testing)
      if (lastDetectedDevice.current && lastDetectedDevice.current !== deviceKey) {
        localStorage.removeItem('analytics_session_id');
        localStorage.removeItem('analytics_session_timestamp');
        console.log('Analytics: Device changed, creating new session');
      }
      lastDetectedDevice.current = deviceKey;
      
      const sessionId = getOrCreateSessionId();
      
      const event: AnalyticsEvent = {
        page_path: pagePath,
        referrer: document.referrer || undefined,
        user_id: user?.id,
        session_id: sessionId,
        device_info: {
          type: deviceInfo.type,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          screen_size: deviceInfo.screenSize
        },
        timestamp: new Date().toISOString()
      };

      trackingQueue.current.push(event);
      
      // Process queue after a short delay to batch events
      setTimeout(processQueue, 1000);
      
      console.log('Analytics: Page view queued for', pagePath, 'as', deviceInfo.type);
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }, [user?.id, isAnalyticsEnabled, processQueue]);

  // Set analytics preference
  const setAnalyticsEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem('analytics_enabled', enabled.toString());
    if (!enabled) {
      // Clear session data when disabled
      localStorage.removeItem('analytics_session_id');
      localStorage.removeItem('analytics_session_timestamp');
      trackingQueue.current = [];
    }
  }, []);

  // Process any remaining events when component unmounts
  useEffect(() => {
    return () => {
      if (trackingQueue.current.length > 0) {
        processQueue();
      }
    };
  }, [processQueue]);

  return {
    trackPageView,
    isAnalyticsEnabled: isAnalyticsEnabled(),
    setAnalyticsEnabled
  };
};
