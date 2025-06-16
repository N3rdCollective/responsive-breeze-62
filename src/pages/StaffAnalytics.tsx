
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import TitleUpdater from '@/components/TitleUpdater';
import { useLiveAnalytics } from '@/hooks/analytics/useLiveAnalytics';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import AnalyticsStatsCards from '@/components/analytics/AnalyticsStatsCards';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import AnalyticsPageDetails from '@/components/analytics/AnalyticsPageDetails';

const StaffAnalytics = () => {
  const navigate = useNavigate();
  const { staffRole, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState('30'); // days

  const {
    analytics,
    loading,
    isLive,
    lastUpdated,
    connectionStatus,
    toggleLiveUpdates,
    refreshAnalytics
  } = useLiveAnalytics(dateRange);

  const handleRefresh = () => {
    refreshAnalytics();
    toast({
      title: "Analytics refreshed",
      description: "Data has been updated with the latest information.",
    });
  };

  // Check authorization
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!staffRole || !['admin', 'super_admin'].includes(staffRole)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have permission to view analytics.</p>
          <Button onClick={() => navigate('/')}>Go to Homepage</Button>
        </div>
      </div>
    );
  }

  // Process analytics data for display
  const totalVisits = analytics.length > 0 ? analytics[0].total_visits : 0;
  const totalUniqueVisitors = analytics.length > 0 ? analytics[0].unique_visitors : 0;
  
  // Top pages data - get unique pages with their visit counts
  const pageMap = new Map();
  analytics.forEach(item => {
    if (item.page_path && item.visit_count) {
      pageMap.set(item.page_path, item.visit_count);
    }
  });
  
  const topPagesData = Array.from(pageMap.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([page, visits]) => ({
      page: page.length > 20 ? page.substring(0, 20) + '...' : page,
      visits: visits
    }));

  // Device breakdown data - get from first row since it's aggregated
  const deviceData = analytics.length > 0 && analytics[0].device_breakdown 
    ? Object.entries(analytics[0].device_breakdown as Record<string, number>).map(([device, count]) => ({
        device: device.charAt(0).toUpperCase() + device.slice(1),
        count: count
      }))
    : [];

  console.log('Dashboard data:', {
    totalVisits,
    totalUniqueVisitors,
    topPagesData,
    deviceData,
    analytics
  });

  return (
    <>
      <TitleUpdater title="Analytics - Staff Panel" />
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto px-4 py-6">
          <AnalyticsHeader
            dateRange={dateRange}
            setDateRange={setDateRange}
            isLive={isLive}
            connectionStatus={connectionStatus}
            lastUpdated={lastUpdated}
            toggleLiveUpdates={toggleLiveUpdates}
            handleRefresh={handleRefresh}
            loading={loading}
          />

          <AnalyticsStatsCards
            totalVisits={totalVisits}
            totalUniqueVisitors={totalUniqueVisitors}
            topPagesCount={topPagesData.length}
            deviceTypesCount={deviceData.length}
            isLive={isLive}
            connectionStatus={connectionStatus}
            loading={loading}
          />

          {!loading && (
            <>
              <AnalyticsCharts
                topPagesData={topPagesData}
                deviceData={deviceData}
              />

              <AnalyticsPageDetails analytics={analytics} />
            </>
          )}

          {/* Debug info - remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Debug Info:</h3>
              <p>Total analytics records: {analytics.length}</p>
              <p>Loading: {loading.toString()}</p>
              <p>Connection: {connectionStatus}</p>
              <p>Last updated: {lastUpdated?.toLocaleString()}</p>
              <details className="mt-2">
                <summary>Raw data</summary>
                <pre className="text-xs mt-2 overflow-auto">
                  {JSON.stringify(analytics.slice(0, 3), null, 2)}
                </pre>
              </details>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default StaffAnalytics;
