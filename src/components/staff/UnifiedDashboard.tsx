import React from "react";
import { useNavigate } from "react-router-dom";
import { useStaffRole } from "@/hooks/useStaffRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  MessageSquare, 
  Settings, 
  FileText, 
  TrendingUp,
  BarChart3,
  Shield,
  Star,
  Tv,
  UserCog,
  Home,
  Activity
} from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";
import QuickStatsGrid from "./dashboard/QuickStatsGrid";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import DashboardLoadingSkeleton from "./dashboard/DashboardLoadingSkeleton";
import DashboardErrorState from "./dashboard/DashboardErrorState";

const UnifiedDashboard = () => {
  const navigate = useNavigate();
  const { userRole, isLoading: authLoading } = useStaffRole();
  const { stats, isLoading, error } = useDashboardStats();

  if (authLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (!userRole) {
    return (
      <>
        <TitleUpdater title="Access Denied - Staff Panel" />
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-destructive">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                You don't have permission to access the staff panel.
              </p>
              <Button onClick={() => navigate('/')} variant="outline">
                Return to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (error) {
    return <DashboardErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  const quickActions = [
    {
      title: "Manage Users",
      description: "View, edit, and manage user accounts",
      icon: Users,
      path: "/staff/users",
      color: "blue",
      roles: ["admin", "super_admin", "moderator"]
    },
    {
      title: "Manage Forum",
      description: "Moderate forum topics and posts",
      icon: MessageSquare,
      path: "/staff/forum",
      color: "green",
      roles: ["admin", "super_admin", "moderator"]
    },
    {
      title: "Manage Staff",
      description: "Add, edit, and manage staff members",
      icon: Shield,
      path: "/staff/manage",
      color: "orange",
      roles: ["admin", "super_admin"]
    },
    {
      title: "Manage Sponsors",
      description: "Add, edit, and manage sponsors",
      icon: Star,
      path: "/staff/sponsors",
      color: "orange",
      roles: ["admin", "super_admin"]
    },
    {
      title: "Manage Homepage",
      description: "Edit and manage homepage content",
      icon: Home,
      path: "/staff/homepage",
      color: "blue",
      roles: ["admin", "super_admin"]
    },
    {
      title: "Manage Schedule",
      description: "Edit and manage the radio schedule",
      icon: Tv,
      path: "/staff/schedule",
      color: "green",
      roles: ["admin", "super_admin"]
    },
    {
      title: "Settings",
      description: "Configure site-wide settings and preferences",
      icon: Settings,
      path: "/staff/settings",
      color: "red",
      roles: ["admin", "super_admin"]
    },
    {
      title: "Edit Profile",
      description: "Edit your staff profile and permissions",
      icon: UserCog,
      path: "/staff/profile",
      color: "blue",
      roles: ["admin", "super_admin", "moderator"]
    },
    {
      title: "Analytics",
      description: "View website analytics and visitor insights",
      icon: BarChart3,
      path: "/staff/analytics",
      color: "purple",
      roles: ["admin", "super_admin"]
    }
  ];

  const filteredActions = quickActions.filter(action => 
    !action.roles || action.roles.includes(userRole)
  );

  return (
    <>
      <TitleUpdater title="Staff Dashboard" />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Here's what's happening with your radio station.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/staff/activity')}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Activity className="h-4 w-4 mr-2" />
              View Activity Logs
            </Button>
          </div>

          <QuickStatsGrid stats={stats} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActions.map((action, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
                onClick={() => navigate(action.path)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${
                      action.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                      action.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                      action.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' :
                      action.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
                      action.color === 'red' ? 'bg-red-100 dark:bg-red-900/20' :
                      'bg-gray-100 dark:bg-gray-900/20'
                    }`}>
                      <action.icon className={`h-6 w-6 ${
                        action.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        action.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        action.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                        action.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                        action.color === 'red' ? 'text-red-600 dark:text-red-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                    {action.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default UnifiedDashboard;
