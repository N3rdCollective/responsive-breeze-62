
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import DashboardHeader from './dashboard/DashboardHeader';
import QuickStatsGrid from './dashboard/QuickStatsGrid';
import RecentActivityCard from './dashboard/RecentActivityCard';
import QuickActionsCard from './dashboard/QuickActionsCard';
import SystemStatusCard from './dashboard/SystemStatusCard';
import DashboardLoadingSkeleton from './dashboard/DashboardLoadingSkeleton';
import DashboardErrorState from './dashboard/DashboardErrorState';

const UnifiedDashboard = () => {
  const { user, staffRole } = useAuth();
  const { stats, loading, error, refreshStats } = useDashboardStats();

  const isAdmin = staffRole === 'admin' || staffRole === 'super_admin';
  const staffName = user?.user_metadata?.display_name || user?.user_metadata?.first_name || user?.email || 'Staff Member';

  if (loading) {
    return <DashboardLoadingSkeleton />;
  }

  if (error) {
    return <DashboardErrorState error={error} onRetry={refreshStats} />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <DashboardHeader 
        staffName={staffName}
        staffRole={staffRole || ''}
        onRefresh={refreshStats}
      />

      {/* Quick Stats Grid */}
      <QuickStatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <RecentActivityCard stats={stats} />

        {/* Quick Actions */}
        <QuickActionsCard isAdmin={isAdmin} />
      </div>

      {/* System Status */}
      <SystemStatusCard />
    </div>
  );
};

export default UnifiedDashboard;
