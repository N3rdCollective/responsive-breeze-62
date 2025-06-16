
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  AlertTriangle
} from 'lucide-react';
import { DashboardStats } from '@/hooks/useDashboardStats';

interface QuickStatsGridProps {
  stats: DashboardStats;
}

const QuickStatsGrid: React.FC<QuickStatsGridProps> = ({ stats }) => {
  const quickStats = [
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: Users,
      trend: stats.usersTrend,
      color: 'blue'
    },
    {
      title: 'Total Posts',
      value: stats.totalPosts.toLocaleString(),
      icon: FileText,
      trend: stats.postsTrend,
      color: 'green'
    },
    {
      title: 'Forum Topics',
      value: stats.activeTopics.toLocaleString(),
      icon: MessageSquare,
      trend: stats.topicsTrend,
      color: 'purple'
    },
    {
      title: 'Pending Reports',
      value: stats.pendingReports.toLocaleString(),
      icon: AlertTriangle,
      trend: stats.pendingReports > 0 ? 'Needs attention' : 'All clear',
      color: stats.pendingReports > 0 ? 'red' : 'green'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {quickStats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  {stat.title}
                </p>
                <p className="text-lg sm:text-2xl font-bold text-foreground mt-1">
                  {stat.value}
                </p>
                <p className={`text-xs mt-1 truncate ${
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'red' ? 'text-red-600' :
                  stat.color === 'blue' ? 'text-blue-600' :
                  'text-purple-600'
                }`}>
                  {stat.trend}
                </p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ml-3 ${
                stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                stat.color === 'red' ? 'bg-red-100 dark:bg-red-900/20' :
                stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                'bg-purple-100 dark:bg-purple-900/20'
              }`}>
                <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 ${
                  stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                  stat.color === 'red' ? 'text-red-600 dark:text-red-400' :
                  stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                  'text-purple-600 dark:text-purple-400'
                }`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickStatsGrid;
