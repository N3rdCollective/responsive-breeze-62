
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaffAuth } from '@/hooks/useStaffAuth';
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
  const { userRole, isLoading: authLoading } = useStaffAuth();
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

  if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
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

  // Process analytics data for charts
  const totalVisits = analytics.reduce((sum, item) => sum + (item.total_visits || 0), 0);
  const totalUniqueVisitors = analytics.reduce((sum, item) => sum + (item.unique_visitors || 0), 0);
  
  // Top pages data
  const topPagesData = analytics
    .filter(item => item.page_path && item.visit_count)
    .slice(0, 10)
    .map(item => ({
      page: item.page_path.length > 20 ? item.page_path.substring(0, 20) + '...' : item.page_path,
      visits: item.visit_count
    }));

  // Device breakdown data - safely handle the Json type
  const deviceData = analytics.length > 0 && analytics[0].device_breakdown 
    ? Object.entries(analytics[0].device_breakdown as Record<string, number>).map(([device, count]) => ({
        device: device.charAt(0).toUpperCase() + device.slice(1),
        count: count
      }))
    : [];

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
        </main>
      </div>
    </>
  );
};

export default StaffAnalytics;
