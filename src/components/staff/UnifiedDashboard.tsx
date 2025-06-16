
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useModerationStats } from '@/hooks/moderation/useModerationStats';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const UnifiedDashboard = () => {
  const { user, staffRole } = useAuth();
  const { stats, loading } = useModerationStats();

  const isAdmin = staffRole === 'admin' || staffRole === 'super_admin';
  const staffName = user?.user_metadata?.display_name || user?.user_metadata?.first_name || user?.email || 'Staff Member';

  const quickStats = [
    {
      title: 'Active Users',
      value: '1,234',
      icon: Users,
      trend: '+12%',
      color: 'blue'
    },
    {
      title: 'Total Posts',
      value: '5,678',
      icon: FileText,
      trend: '+8%',
      color: 'green'
    },
    {
      title: 'Forum Topics',
      value: stats.activeTopics.toString(),
      icon: MessageSquare,
      trend: '+15%',
      color: 'purple'
    },
    {
      title: 'Pending Reports',
      value: stats.pendingReports.toString(),
      icon: AlertTriangle,
      trend: stats.pendingReports > 0 ? 'Needs attention' : 'All clear',
      color: stats.pendingReports > 0 ? 'red' : 'green'
    }
  ];

  const recentActivity = [
    { action: 'New user registration', time: '2 minutes ago', status: 'success' },
    { action: 'Forum post reported', time: '15 minutes ago', status: 'warning' },
    { action: 'News article published', time: '1 hour ago', status: 'success' },
    { action: 'Show scheduled updated', time: '2 hours ago', status: 'info' }
  ];

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 px-2 sm:px-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
            Welcome back, {staffName}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Here's what's happening with your station today.
          </p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          <Badge variant="secondary" className="text-xs px-2 py-1 w-full sm:w-auto justify-center sm:justify-start">
            {staffRole?.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Quick Stats Grid */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3 sm:space-y-4 max-h-80 overflow-y-auto">
              {recentActivity.map((activity, index) => (
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
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 gap-3">
              <Button variant="outline" className="justify-start h-auto p-3 sm:p-4 w-full" asChild>
                <a href="/staff/news" className="flex items-start gap-3 text-left">
                  <FileText className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base truncate">Manage News</div>
                    <div className="text-xs text-muted-foreground">Create & edit posts</div>
                  </div>
                </a>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-3 sm:p-4 w-full" asChild>
                <a href="/staff/users" className="flex items-start gap-3 text-left">
                  <Users className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base truncate">User Management</div>
                    <div className="text-xs text-muted-foreground">Manage members</div>
                  </div>
                </a>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-3 sm:p-4 w-full" asChild>
                <a href="/staff/analytics" className="flex items-start gap-3 text-left">
                  <BarChart3 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm sm:text-base truncate">Analytics</div>
                    <div className="text-xs text-muted-foreground">View insights</div>
                  </div>
                </a>
              </Button>
              
              {isAdmin && (
                <Button variant="outline" className="justify-start h-auto p-3 sm:p-4 w-full" asChild>
                  <a href="/staff/homepage" className="flex items-start gap-3 text-left">
                    <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">Site Settings</div>
                      <div className="text-xs text-muted-foreground">Configure system</div>
                    </div>
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
            <span className="truncate">System Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg min-h-[4rem]">
              <span className="text-sm font-medium truncate">Server Status</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs flex-shrink-0 ml-2">
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg min-h-[4rem]">
              <span className="text-sm font-medium truncate">Database</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs flex-shrink-0 ml-2">
                Healthy
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg min-h-[4rem] sm:col-span-2 lg:col-span-1">
              <span className="text-sm font-medium truncate">Stream Status</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs flex-shrink-0 ml-2">
                Live
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedDashboard;
