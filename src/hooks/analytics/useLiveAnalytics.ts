
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  total_visits: number;
  unique_visitors: number;
  page_path: string;
  visit_count: number;
  device_breakdown: Record<string, number>;
}

interface ProcessedAnalytics {
  totalVisits: number;
  totalUniqueVisitors: number;
  topPages: Array<{ page: string; visits: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
}

interface LiveAnalyticsState {
  data: ProcessedAnalytics;
  isLive: boolean;
  lastUpdated: Date | null;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

export const useLiveAnalytics = (dateRange: string = '30') => {
  const { toast } = useToast();
  const [state, setState] = useState<LiveAnalyticsState>({
    data: {
      totalVisits: 0,
      totalUniqueVisitors: 0,
      topPages: [],
      deviceBreakdown: []
    },
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

      if (data && data.length > 0) {
        // Process the data properly
        const firstRow = data[0];
        
        const processedData: ProcessedAnalytics = {
          totalVisits: Number(firstRow.total_visits) || 0,
          totalUniqueVisitors: Number(firstRow.unique_visitors) || 0,
          topPages: data.map((row: AnalyticsData) => ({
            page: row.page_path || 'Unknown',
            visits: Number(row.visit_count) || 0
          })).filter(page => page.page && page.visits > 0).slice(0, 10),
          deviceBreakdown: firstRow.device_breakdown 
            ? Object.entries(firstRow.device_breakdown as Record<string, number>).map(([device, count]) => ({
                device: device.charAt(0).toUpperCase() + device.slice(1),
                count: Number(count) || 0
              }))
            : []
        };

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
          data: {
            totalVisits: 0,
            totalUniqueVisitors: 0,
            topPages: [],
            deviceBreakdown: []
          },
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
      
      setState(prev => ({
        ...prev,
        data: {
          totalVisits: 0,
          totalUniqueVisitors: 0,
          topPages: [],
          deviceBreakdown: []
        },
        lastUpdated: new Date()
      }));
    } finally {
      setLoading(false);
    }
  }, [dateRange, toast]);

  const startLiveUpdates = useCallback(() => {
    if (state.isLive) return;

    setState(prev => ({ ...prev, isLive: true, connectionStatus: 'connecting' }));

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

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

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
