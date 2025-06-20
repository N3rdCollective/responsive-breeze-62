
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
  const [dateRange, setDateRange] = useState('30');

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

  console.log('Analytics data:', analytics);

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
            totalVisits={analytics.totalVisits}
            totalUniqueVisitors={analytics.totalUniqueVisitors}
            topPagesCount={analytics.topPages.length}
            deviceTypesCount={analytics.deviceBreakdown.length}
            isLive={isLive}
            connectionStatus={connectionStatus}
            loading={loading}
          />

          {!loading && (
            <>
              <AnalyticsCharts
                topPagesData={analytics.topPages}
                deviceData={analytics.deviceBreakdown}
              />

              <AnalyticsPageDetails analytics={analytics.topPages} />
            </>
          )}

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Debug Info:</h3>
              <p>Total visits: {analytics.totalVisits}</p>
              <p>Unique visitors: {analytics.totalUniqueVisitors}</p>
              <p>Top pages count: {analytics.topPages.length}</p>
              <p>Device types: {analytics.deviceBreakdown.length}</p>
              <p>Loading: {loading.toString()}</p>
              <p>Connection: {connectionStatus}</p>
              <p>Last updated: {lastUpdated?.toLocaleString()}</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default StaffAnalytics;
