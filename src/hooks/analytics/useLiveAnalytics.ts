
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  total_visits: number;
  unique_visitors: number;
  page_path: string;
  visit_count: number;
  device_breakdown: any;
}

interface LiveAnalyticsState {
  data: AnalyticsData[];
  isLive: boolean;
  lastUpdated: Date | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

export const useLiveAnalytics = (dateRange: string = '30') => {
  const { toast } = useToast();
  const [state, setState] = useState<LiveAnalyticsState>({
    data: [],
    isLive: false,
    lastUpdated: null,
    connectionStatus: 'disconnected'
  });
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      const { data, error } = await supabase.rpc('get_analytics_summary', {
        start_date: startDate.toISOString(),
        end_date: new Date().toISOString()
      });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        data: data || [],
        lastUpdated: new Date()
      }));
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error loading analytics",
        description: error.message || "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange, toast]);

  const startLiveUpdates = useCallback(() => {
    if (state.isLive) return;

    setState(prev => ({ ...prev, isLive: true, connectionStatus: 'connecting' }));

    // Set up real-time subscription for new analytics data
    const channel = supabase
      .channel('analytics-live-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics'
        },
        (payload) => {
          console.log('New analytics data received:', payload);
          // Refresh data when new analytics are added
          fetchAnalytics();
          
          toast({
            title: "Live Update",
            description: "New visitor activity detected",
            duration: 2000
          });
        }
      )
      .subscribe((status) => {
        console.log('Analytics subscription status:', status);
        setState(prev => ({
          ...prev,
          connectionStatus: status === 'SUBSCRIBED' ? 'connected' : 'disconnected'
        }));
      });

    channelRef.current = channel;

    // Set up auto-refresh every 30 seconds
    autoRefreshRef.current = setInterval(() => {
      fetchAnalytics();
    }, 30000);

  }, [state.isLive, fetchAnalytics, toast]);

  const stopLiveUpdates = useCallback(() => {
    setState(prev => ({ ...prev, isLive: false, connectionStatus: 'disconnected' }));

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
      autoRefreshRef.current = null;
    }
  }, []);

  const toggleLiveUpdates = useCallback(() => {
    if (state.isLive) {
      stopLiveUpdates();
    } else {
      startLiveUpdates();
    }
  }, [state.isLive, startLiveUpdates, stopLiveUpdates]);

  // Initial data fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLiveUpdates();
    };
  }, [stopLiveUpdates]);

  return {
    analytics: state.data,
    loading,
    isLive: state.isLive,
    lastUpdated: state.lastUpdated,
    connectionStatus: state.connectionStatus,
    toggleLiveUpdates,
    refreshAnalytics: fetchAnalytics
  };
};
