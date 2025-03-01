
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

export function usePageTracking() {
  const location = useLocation();
  
  useEffect(() => {
    const trackPageView = async () => {
      try {
        // Get session ID from localStorage or create a new one
        let sessionId = localStorage.getItem('analytics_session_id');
        
        // Call the edge function to track the page view
        const { data, error } = await supabase.functions.invoke('track-pageview', {
          body: {
            path: location.pathname,
            referrer: document.referrer,
            sessionId
          }
        });
        
        if (error) {
          console.error('Failed to track page view:', error);
          return;
        }
        
        // Store the session ID if it's a new session
        if (data?.sessionId && !sessionId) {
          localStorage.setItem('analytics_session_id', data.sessionId);
        }
      } catch (err) {
        console.error('Analytics tracking error:', err);
      }
    };
    
    trackPageView();
  }, [location]);
}
