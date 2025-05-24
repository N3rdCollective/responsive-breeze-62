
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import ManageStaffModal from "@/components/ManageStaffModal";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import StaffProfileEditor from "@/components/staff/StaffProfileEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator"; // Not used in the provided code
// import { AlertCircle, CheckCircle, Clock } from "lucide-react"; // Not used in the provided code
import { 
  UserCog, 
  BarChart3, 
  Users, 
  FileText, 
  Radio, 
  Shield, 
  Flag,
  Settings,
  TrendingUp,
  Plus,
  // Eye, // Not used in the provided code
  RefreshCw
} from "lucide-react";

// Import existing components
import ContentManagementCard from "@/components/staff/ContentManagementCard";
import ShowManagementCard from "@/components/staff/ShowManagementCard";
import AdminCard from "@/components/staff/AdminCard";
import LoadingSpinner from "@/components/staff/LoadingSpinner";

// Import moderation components
import ReportedContentSection from '@/components/staff/moderator-dashboard/ReportedContentSection';
import ReportDetails from '@/components/staff/moderator-dashboard/ReportDetails';

// Import database hooks
import { useContentReports } from '@/hooks/moderation/useContentReports'; // ContentReport type is implicitly imported here
import { useModerationStats } from '@/hooks/moderation/useModerationStats';

const UnifiedStaffDashboard = () => {
  const { toast } = useToast();
  const [isManageStaffOpen, setIsManageStaffOpen] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const { staffName, isAdmin, isLoading, handleLogout, userRole } = useStaffAuth();
  
  // Tab state with URL persistence
  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab') || 'overview';
  });
  
  // Moderation dashboard state
  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [moderationNote, setModerationNote] = useState('');
  
  // Use database hooks for real data
  const { reports, loading: reportsLoading, updateReportStatus, createModerationAction } = useContentReports();
  const { stats: dashboardStats, loading: statsLoading, refreshStats } = useModerationStats();

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (activeTab === 'overview') {
      url.searchParams.delete('tab');
    } else {
      url.searchParams.set('tab', activeTab);
    }
    window.history.replaceState({}, '', url.toString());
  }, [activeTab]);

  const filteredReports = reports.filter(report => {
    const statusMatch = filterStatus === 'all' || report.status === filterStatus;
    const searchLower = searchTerm.toLowerCase();
    const termMatch = searchTerm === '' || 
                      (report.content_preview?.toLowerCase().includes(searchLower)) ||
                      report.report_reason.toLowerCase().includes(searchLower) ||
                      report.reporter_name.toLowerCase().includes(searchLower) ||
                      report.reported_user_name.toLowerCase().includes(searchLower) ||
                      (report.topic_title?.toLowerCase().includes(searchLower));
    return statusMatch && termMatch;
  });

  const handleModerationAction = async (action: string, reportId: string) => {
    console.log(`Taking action "${action}" on report ${reportId}`);
    
    try {
      // Create moderation action record
      const actionSuccess = await createModerationAction(reportId, action, moderationNote);
      
      if (actionSuccess) {
        // Update report status
        let newStatus: 'resolved' | 'rejected' = 'resolved';
        if (action === 'dismiss') {
          newStatus = 'rejected';
        }
        
        const updateSuccess = await updateReportStatus(reportId, newStatus);
        
        if (updateSuccess) {
          setSelectedFlagId(null);
          setModerationNote('');
          if (refreshStats) refreshStats(); // Refresh stats after action
          toast({
            title: "Action completed",
            description: `Report has been ${action === 'dismiss' ? 'dismissed' : 'resolved'}.`,
          });
        }
      }
    } catch (error) {
      console.error('Error handling moderation action:', error);
      toast({
        title: "Error",
        description: "Failed to complete moderation action",
        variant: "destructive"
      });
    }
  };

  const handleManageUsers = () => {
    setIsManageStaffOpen(true);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-post':
        // Navigate to new post creation
        // Consider using useNavigate from react-router-dom for internal navigation
        window.location.href = '/staff/news/editor'; // Updated path
        break;
      case 'manage-shows':
        setActiveTab('shows');
        break;
      case 'view-reports':
        setActiveTab('moderation');
        break;
      case 'manage-staff':
        handleManageUsers();
        break;
      default:
        break;
    }
  };

  const selectedReportData = selectedFlagId ? reports.find(r => r.id === selectedFlagId) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  // Enhanced stats overview with better visual hierarchy
  const StatsOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Listeners</p>
                <p className="text-2xl font-bold">1.2M</p> {/* This is static, consider making it dynamic */}
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last month {/* This is static */}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Topics</p>
                <p className="text-2xl font-bold">{statsLoading ? '...' : dashboardStats.activeTopics}</p>
                <p className="text-xs text-muted-foreground mt-1">Forum discussions</p>
              </div>
              <Radio className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={`border-l-4 ${dashboardStats.pendingReports > 0 ? 'border-l-red-500' : 'border-l-gray-300 dark:border-l-gray-600'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reports</p>
                <p className={`text-2xl font-bold ${dashboardStats.pendingReports > 0 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  {statsLoading ? '...' : dashboardStats.pendingReports}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {dashboardStats.pendingReports > 0 ? 'Needs attention' : 'All clear'}
                </p>
              </div>
              <Flag className={`h-8 w-8 ${dashboardStats.pendingReports > 0 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Members</p>
                <p className="text-2xl font-bold">{statsLoading ? '...' : dashboardStats.newMembers}</p>
                <p className="text-xs text-muted-foreground mt-1">This week</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Overview Tab */}
      {activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" onClick={() => handleQuickAction('new-post')} className="h-20 flex-col gap-2">
                <FileText className="h-6 w-6" />
                <span className="text-sm">New Post</span>
              </Button>
              <Button variant="outline" onClick={() => handleQuickAction('manage-shows')} className="h-20 flex-col gap-2">
                <Radio className="h-6 w-6" />
                <span className="text-sm">Manage Shows</span>
              </Button>
              <Button 
                variant={!statsLoading && dashboardStats.pendingReports > 0 ? "destructive" : "outline"} 
                onClick={() => handleQuickAction('view-reports')} 
                className="h-20 flex-col gap-2"
              >
                <Flag className="h-6 w-6" />
                <span className="text-sm">
                  {!statsLoading && dashboardStats.pendingReports > 0 ? `${dashboardStats.pendingReports} Reports` : 'View Reports'}
                </span>
              </Button>
              {isAdmin && (
                <Button variant="outline" onClick={() => handleQuickAction('manage-staff')} className="h-20 flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Manage Staff</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="space-y-8">
          {/* Enhanced Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">Staff Dashboard</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-muted-foreground">Welcome back, {staffName}</p>
                {isAdmin && <Badge variant="secondary">Admin</Badge>}
                {userRole && <Badge variant="outline" className="capitalize">{userRole.replace(/_/g, ' ')}</Badge>}
              </div>
            </div>
            
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  if(refreshStats) refreshStats();
                  toast({ title: "Data refreshed", description: "Dashboard data has been updated." });
                }}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsProfileEditorOpen(true)}
                className="flex items-center gap-2"
              >
                <UserCog className="h-4 w-4" />
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <StatsOverview />

          {/* Main Tabbed Interface with improved styling */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="border-b dark:border-gray-700">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 h-auto p-1 bg-muted dark:bg-gray-800 rounded-md">
                <TabsTrigger value="overview" className="flex items-center gap-2 py-2.5 sm:py-3 data-[state=active]:bg-background dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2 py-2.5 sm:py-3 data-[state=active]:bg-background dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Content</span>
                   <span className="sm:hidden">Content</span>
                </TabsTrigger>
                <TabsTrigger value="shows" className="flex items-center gap-2 py-2.5 sm:py-3 data-[state=active]:bg-background dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm">
                  <Radio className="h-4 w-4" />
                  <span className="hidden sm:inline">Shows</span>
                  <span className="sm:hidden">Shows</span>
                </TabsTrigger>
                <TabsTrigger value="moderation" className="flex items-center gap-2 py-2.5 sm:py-3 relative data-[state=active]:bg-background dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Moderation</span>
                  <span className="sm:hidden">Mods</span>
                  {!statsLoading && dashboardStats.pendingReports > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 min-w-[22px] h-5 text-xs flex items-center justify-center">
                      {dashboardStats.pendingReports}
                    </Badge>
                  )}
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="admin" className="flex items-center gap-2 py-2.5 sm:py-3 data-[state=active]:bg-background dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                    <span className="sm:hidden">Admin</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ContentManagementCard userRole={userRole} />
                <ShowManagementCard />
                <AdminCard 
                  onManageStaff={handleManageUsers} 
                  onLogout={handleLogout} 
                  userRole={userRole}
                />
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Content Management
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage news articles, featured artists, and other website content.
                  </p>
                </CardHeader>
                <CardContent>
                  <ContentManagementCard userRole={userRole} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shows" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Radio className="h-5 w-5" />
                    Show Management
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage radio shows, schedules, and programming.
                  </p>
                </CardHeader>
                <CardContent>
                  <ShowManagementCard />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="moderation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Content Moderation
                    {!statsLoading && dashboardStats.pendingReports > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {dashboardStats.pendingReports} Pending
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Review and moderate reported content from the community.
                  </p>
                </CardHeader>
                <CardContent>
                  {reportsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <ReportedContentSection
                      filteredReports={filteredReports.map(report => ({
                        id: report.id,
                        contentType: report.content_type as 'post' | 'topic',
                        contentId: report.content_id,
                        content: report.content_preview || '',
                        reportReason: report.report_reason,
                        reporter: {
                          id: `reporter-${report.reporter_name}-${report.id}`, // more unique id
                          name: report.reporter_name,
                          avatar: report.reporter_avatar || '/placeholder.svg'
                        },
                        author: {
                          id: `author-${report.reported_user_name}-${report.id}`, // more unique id
                          name: report.reported_user_name,
                          avatar: report.reported_user_avatar || '/placeholder.svg',
                          joinDate: new Date().toISOString(), // Placeholder, consider fetching real join date
                          postCount: 0, // Placeholder
                          previousFlags: 0 // Placeholder
                        },
                        timestamp: report.created_at,
                        topic: {
                          id: report.topic_id || `topic-${report.id}`, // Ensure topic always has an id
                          title: report.topic_title || 'Unknown Topic',
                          category: 'General' // Placeholder
                        },
                        status: report.status,
                        resolution: report.action_type ? {
                          action: report.action_type,
                          moderator: report.moderator_name || 'Unknown',
                          timestamp: report.action_created_at || new Date().toISOString(),
                          note: report.action_note || ''
                        } : undefined
                      }))}
                      selectedFlag={selectedFlagId}
                      setSelectedFlag={setSelectedFlagId}
                      filterStatus={filterStatus}
                      setFilterStatus={setFilterStatus}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {isAdmin && (
              <TabsContent value="admin" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Administration
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Administrative tools and settings available to administrators.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <AdminCard 
                      onManageStaff={handleManageUsers} 
                      onLogout={handleLogout} 
                      userRole={userRole}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
      
      {/* Modals */}
      <ManageStaffModal 
        open={isManageStaffOpen}
        onOpenChange={setIsManageStaffOpen}
        currentUserRole={userRole || ''} // Ensure currentUserRole is always a string
      />
      
      <StaffProfileEditor
        open={isProfileEditorOpen}
        onOpenChange={setIsProfileEditorOpen}
      />

      {/* Report Details Modal */}
      {selectedReportData && (
        <ReportDetails
          reportData={{
            id: selectedReportData.id,
            contentType: selectedReportData.content_type as 'post' | 'topic',
            contentId: selectedReportData.content_id,
            content: selectedReportData.content_preview || '',
            reportReason: selectedReportData.report_reason,
            reporter: {
              id: `reporter-detail-${selectedReportData.reporter_name}-${selectedReportData.id}`,
              name: selectedReportData.reporter_name,
              avatar: selectedReportData.reporter_avatar || '/placeholder.svg'
            },
            author: {
              id: `author-detail-${selectedReportData.reported_user_name}-${selectedReportData.id}`,
              name: selectedReportData.reported_user_name,
              avatar: selectedReportData.reported_user_avatar || '/placeholder.svg',
              joinDate: new Date().toISOString(),
              postCount: 0,
              previousFlags: 0
            },
            timestamp: selectedReportData.created_at,
            topic: {
              id: selectedReportData.topic_id || `topic-detail-${selectedReportData.id}`,
              title: selectedReportData.topic_title || 'Unknown Topic',
              category: 'General'
            },
            status: selectedReportData.status,
            resolution: selectedReportData.action_type ? {
              action: selectedReportData.action_type,
              moderator: selectedReportData.moderator_name || 'Unknown',
              timestamp: selectedReportData.action_created_at || new Date().toISOString(),
              note: selectedReportData.action_note || ''
            } : undefined
          }}
          onClose={() => setSelectedFlagId(null)}
          onAction={handleModerationAction}
          moderationNote={moderationNote}
          setModerationNote={setModerationNote}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default UnifiedStaffDashboard;

