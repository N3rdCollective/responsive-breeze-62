
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
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      console.log('Fetching analytics from:', startDate.toISOString(), 'to:', new Date().toISOString());
      
      const { data, error } = await supabase.rpc('get_analytics_summary', {
        start_date: startDate.toISOString(),
        end_date: new Date().toISOString()
      });

      if (error) {
        console.error('Analytics fetch error:', error);
        throw error;
      }

      console.log('Raw analytics data:', data);

      // Process the data to handle the cross join structure
      if (data && data.length > 0) {
        // Group the data properly since it comes from cross joins
        const processedData = data.map((row: any) => ({
          total_visits: Number(row.total_visits) || 0,
          unique_visitors: Number(row.unique_visitors) || 0,
          page_path: row.page_path || '',
          visit_count: Number(row.visit_count) || 0,
          device_breakdown: row.device_breakdown || {}
        }));

        console.log('Processed analytics data:', processedData);
        
        setState(prev => ({
          ...prev,
          data: processedData,
          lastUpdated: new Date()
        }));
      } else {
        // No data found, set empty state
        setState(prev => ({
          ...prev,
          data: [],
          lastUpdated: new Date()
        }));
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error loading analytics",
        description: error.message || "Failed to load analytics data",
        variant: "destructive"
      });
      
      // Set empty data on error
      setState(prev => ({
        ...prev,
        data: [],
        lastUpdated: new Date()
      }));
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
