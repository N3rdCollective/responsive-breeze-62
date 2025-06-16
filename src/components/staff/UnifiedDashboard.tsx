
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
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
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {staffName}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your station today.
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {staffRole?.toUpperCase()}
        </Badge>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className={`text-xs ${
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'red' ? 'text-red-600' :
                    stat.color === 'blue' ? 'text-blue-600' :
                    'text-purple-600'
                  }`}>
                    {stat.trend}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                  stat.color === 'red' ? 'bg-red-100 dark:bg-red-900/20' :
                  stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                  'bg-purple-100 dark:bg-purple-900/20'
                }`}>
                  <stat.icon className={`h-6 w-6 ${
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'warning' ? 'bg-yellow-500' :
                      activity.status === 'error' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} />
                    <span className="text-sm font-medium">{activity.action}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start h-auto p-4" asChild>
                <a href="/staff/news">
                  <FileText className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Manage News</div>
                    <div className="text-xs text-muted-foreground">Create & edit posts</div>
                  </div>
                </a>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4" asChild>
                <a href="/staff/users">
                  <Users className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">User Management</div>
                    <div className="text-xs text-muted-foreground">Manage members</div>
                  </div>
                </a>
              </Button>
              
              <Button variant="outline" className="justify-start h-auto p-4" asChild>
                <a href="/staff/analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Analytics</div>
                    <div className="text-xs text-muted-foreground">View insights</div>
                  </div>
                </a>
              </Button>
              
              {isAdmin && (
                <Button variant="outline" className="justify-start h-auto p-4" asChild>
                  <a href="/staff/homepage">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Site Settings</div>
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-sm font-medium">Server Status</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm font-medium">Database</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Healthy
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="text-sm font-medium">Stream Status</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
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
