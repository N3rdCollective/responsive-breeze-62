
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { DashboardStats } from '@/hooks/useDashboardStats';

interface RecentActivityCardProps {
  stats: DashboardStats;
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ stats }) => {
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="truncate">Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 sm:space-y-4 max-h-80 overflow-y-auto">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0 min-h-[3rem]">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'warning' ? 'bg-yellow-500' :
                    activity.status === 'error' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`} />
                  <span className="text-xs sm:text-sm font-medium truncate">{activity.action}</span>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">{activity.time}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No recent activity found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
