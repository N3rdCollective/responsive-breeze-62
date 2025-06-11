import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useLocation } from "react-router-dom";
import ManageStaffModal from "@/components/ManageStaffModal";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import StaffProfileEditor from "@/components/staff/StaffProfileEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserCog, 
  Users, 
  FileText, 
  Radio, 
  Shield, 
  Flag,
  Settings,
  TrendingUp,
  Plus,
  RefreshCw,
  Search,
  Video,
} from "lucide-react";

// Import existing components
import ContentManagementCard from "@/components/staff/ContentManagementCard";
import ShowManagementCard from "@/components/staff/ShowManagementCard";
import AdminCard from "@/components/staff/AdminCard";
import LoadingSpinner from "@/components/staff/LoadingSpinner";

// Import user management components
import UserTable from '@/components/staff/users/UserTable';
import UserActionDialog from '@/components/staff/users/UserActionDialog';
import SendMessageDialog from '@/components/staff/users/SendMessageDialog';

// Import moderation components
import ReportedContentSection from '@/components/staff/moderator-dashboard/ReportedContentSection';
import ReportDetails from '@/components/staff/moderator-dashboard/ReportDetails';

// Import video management components
import { HomeSettingsProvider } from "@/components/staff/home/context/HomeSettingsContext";
import VideosTabContent from "@/components/staff/home/components/VideosTabContent";

// Import database hooks
import { useContentReports, ContentReport } from '@/hooks/moderation/useContentReports';
import { useModerationStats } from '@/hooks/moderation/useModerationStats';
import { useUserManagement, User } from '@/hooks/admin/useUserManagement';
import { useStaffActivityLogger } from '@/hooks/useStaffActivityLogger';

const UnifiedStaffDashboard = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [isManageStaffOpen, setIsManageStaffOpen] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const { staffName, isAdmin, isLoading: authLoading, handleLogout, userRole } = useStaffAuth();
  const { logActivity } = useStaffActivityLogger();
  
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || 'content'; // Default to 'content'
  });

  // Listen for URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    } else if (!tabParam && activeTab !== 'content') {
      setActiveTab('content');
    }
  }, [searchParams, activeTab]);

  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    if (newTab === 'content') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', newTab);
    }
    setSearchParams(searchParams, { replace: true });
  };
  
  // Moderation dashboard state
  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [moderationNote, setModerationNote] = useState('');
  
  const { 
    reports, 
    loading: reportsLoading, 
    updateReportStatus, 
    createModerationAction,
    removeContentOnDb, 
    lockTopicOnDb
  } = useContentReports();
  const { stats: dashboardStats, loading: statsLoading, refreshStats } = useModerationStats();
  
  const { 
    users: allUsers, 
    loading: usersLoading, 
    error: usersError,
    updateUserStatus: liveUpdateUserStatus, 
    sendUserMessage: liveSendUserMessage, 
    searchUsers: searchUsersHook,
    refreshUsers 
  } = useUserManagement();
  
  // User management UI state
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilterStatus, setUserFilterStatus] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
  const [userFilterRole, setUserFilterRole] = useState<'all' | 'user' | 'moderator' | 'admin'>('all');
  
  const [userActionDialogState, setUserActionDialogState] = useState<{
    open: boolean;
    action: 'suspend' | 'ban' | 'unban' | null;
    user: User | null;
  }>({ open: false, action: null, user: null });
  const [actionReason, setActionReason] = useState('');
  
  const [messageDialogState, setMessageDialogState] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');

  useEffect(() => {
    const url = new URL(window.location.href);
    if (activeTab === 'content') { // Default tab
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

  const handleModerationAction = async (
    action: string, 
    reportId: string,
    details?: {
      reportedUserId?: string;
      contentId?: string;
      contentType?: 'post' | 'topic';
      topicId?: string;
    }
  ) => {
    console.log(`Taking action "${action}" on report ${reportId}`, details);
    
    if ((action === 'ban_user' || action === 'warn_user') && !moderationNote.trim()) {
      toast({ title: "Missing Note", description: "A moderation note is required for this action.", variant: "destructive" });
      return;
    }

    try {
      const actionLogged = await createModerationAction(reportId, action, moderationNote);
      if (!actionLogged) {
        toast({ title: "Error", description: "Failed to log moderation action entry.", variant: "destructive" });
        // Decide if we should return or proceed with the action anyway. For now, let's proceed.
      }

      let newStatus: 'pending' | 'resolved' | 'rejected' = 'resolved';
      let actionCompleted = false;
      let mainActionSuccessful = false;

      switch (action) {
        case 'dismiss':
          newStatus = 'rejected';
          mainActionSuccessful = await updateReportStatus(reportId, newStatus);
          if (mainActionSuccessful) {
            logActivity('dismiss_report', `Report ${reportId} dismissed.`, 'content_report', reportId, { reason: moderationNote });
          }
          break;
        case 'reopen':
          newStatus = 'pending';
          mainActionSuccessful = await updateReportStatus(reportId, newStatus);
          if (mainActionSuccessful) {
            logActivity('reopen_report', `Report ${reportId} reopened.`, 'content_report', reportId);
          }
          break;
        case 'ban_user':
          if (details?.reportedUserId) {
            const banSuccess = await liveUpdateUserStatus(details.reportedUserId, 'banned', moderationNote, 'ban');
            if (banSuccess) {
              // logActivity already handled by liveUpdateUserStatus via useUserActions
              mainActionSuccessful = await updateReportStatus(reportId, 'resolved');
            } else {
               toast({ title: "Ban Failed", description: "Could not ban the user.", variant: "destructive" });
            }
          } else {
            toast({ title: "Missing Info", description: "User ID is required to ban a user.", variant: "destructive" });
          }
          break;
        case 'remove_content':
          if (details?.contentId && details?.contentType) {
            const removeSuccess = await removeContentOnDb(details.contentId, details.contentType);
            if (removeSuccess) {
              logActivity(
                details.contentType === 'post' ? 'delete_forum_post' : 'delete_forum_topic', 
                `${details.contentType} removed due to report ${reportId}. Note: ${moderationNote}`, 
                details.contentType === 'post' ? 'post' : 'forum_topic', 
                details.contentId
              );
              mainActionSuccessful = await updateReportStatus(reportId, 'resolved');
            }
          } else {
            toast({ title: "Missing Info", description: "Content ID and type are required to remove content.", variant: "destructive" });
          }
          break;
        case 'lock_topic':
          if (details?.topicId) {
            const lockResult = await lockTopicOnDb(details.topicId);
            if (lockResult.success) {
              logActivity(
                lockResult.locked ? 'lock_forum_topic' : 'unlock_forum_topic', 
                `Topic ${details.topicId} ${lockResult.locked ? 'locked' : 'unlocked'} due to report ${reportId}. Note: ${moderationNote}`,
                'forum_topic', 
                details.topicId
              );
              mainActionSuccessful = await updateReportStatus(reportId, 'resolved');
            }
          } else {
             toast({ title: "Missing Info", description: "Topic ID is required to lock/unlock a topic.", variant: "destructive" });
          }
          break;
        case 'warn_user':
          if (details?.reportedUserId) {
            const subject = "Official Warning from Staff";
            const messageSuccess = await liveSendUserMessage(details.reportedUserId, subject, moderationNote);
            if (messageSuccess) {
              logActivity(
                'warn_user',
                `User ${details.reportedUserId} warned due to report ${reportId}. Reason: ${moderationNote}`,
                'user',
                details.reportedUserId,
                { reason: moderationNote, reportId: reportId }
              );
              mainActionSuccessful = await updateReportStatus(reportId, 'resolved');
              toast({ title: "User Warned", description: "Warning message sent successfully."});
            } else {
              toast({ title: "Warning Failed", description: "Could not send warning message.", variant: "destructive" });
            }
          } else {
            toast({ title: "Missing Info", description: "User ID is required to warn a user.", variant: "destructive" });
          }
          break;
        case 'edit_content':
          logActivity(
            'mark_content_for_edit', 
            `Content ${details?.contentId} marked for edit due to report ${reportId}. Note: ${moderationNote}`, 
            details?.contentType === 'topic' ? 'forum_topic' : details?.contentType, // Fixed: map 'topic' to 'forum_topic'
            details?.contentId
          );
          mainActionSuccessful = await updateReportStatus(reportId, 'resolved');
          toast({ title: "Action Logged", description: "Content has been marked for edit."});
          break;
        case 'move_topic':
          if (details?.topicId) {
            logActivity(
              'mark_topic_for_move', 
              `Topic ${details.topicId} marked for move due to report ${reportId}. Note: ${moderationNote}`, 
              'forum_topic', 
              details.topicId
            );
            mainActionSuccessful = await updateReportStatus(reportId, 'resolved');
            toast({ title: "Action Logged", description: "Topic has been marked for move."});
          } else {
            toast({ title: "Missing Info", description: "Topic ID is required for this action.", variant: "destructive" });
          }
          break;
        default: 
          mainActionSuccessful = await updateReportStatus(reportId, 'resolved');
          // Generic log for other actions if any
          logActivity(action, `Report ${reportId} actioned with '${action}'. Note: ${moderationNote}`, 'content_report', reportId);
          toast({ title: "Action Complete", description: `Action "${action.replace(/_/g, ' ')}" was successful.` });
          break;
      }
      
      actionCompleted = mainActionSuccessful; // If main action succeeded, consider it completed for UI update

      if (actionCompleted) {
        setSelectedFlagId(null);
        setModerationNote('');
        if (refreshStats) refreshStats();
      }

    } catch (error) {
      console.error('Error handling moderation action:', error);
      toast({
        title: "Error",
        description: "Failed to complete moderation action.",
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
        window.location.href = '/staff/news/editor'; 
        break;
      case 'manage-shows':
        setActiveTab('shows');
        break;
      case 'manage-videos':
        setActiveTab('videos');
        break;
      case 'view-reports':
        setActiveTab('moderation');
        break;
      case 'manage-staff':
        handleManageUsers();
        break;
      case 'manage-users': 
        setActiveTab('users');
        break;
      default:
        break;
    }
  };
  
  const selectedReportData = selectedFlagId ? reports.find(r => r.id === selectedFlagId) : null;

  const openUserActionDialog = (action: 'suspend' | 'ban' | 'unban', user: User) => {
    setUserActionDialogState({ open: true, action, user });
    setActionReason(''); 
  };

  const handleUserAction = async () => { 
    if (!userActionDialogState.user || !userActionDialogState.action || !actionReason.trim()) {
      toast({ title: "Missing Information", description: "A reason is required for this action.", variant: "destructive"});
      return;
    }
    
    const { user, action } = userActionDialogState;
    let targetStatus: User['status'];
    let actionTypeForHook: 'suspend' | 'ban' | 'unban';

    switch (action) {
      case 'suspend':
        targetStatus = 'suspended';
        actionTypeForHook = 'suspend';
        break;
      case 'ban':
        targetStatus = 'banned';
        actionTypeForHook = 'ban';
        break;
      case 'unban':
        targetStatus = 'active';
        actionTypeForHook = 'unban';
        break;
      default:
        toast({ title: "Error", description: "Unknown user action.", variant: "destructive" });
        return;
    }

    const success = await liveUpdateUserStatus(user.id, targetStatus, actionReason, actionTypeForHook);

    if (success) {
      setUserActionDialogState({ open: false, action: null, user: null });
      setActionReason('');
    }
  };

  const openMessageDialog = (user: User) => {
    setMessageSubject(''); 
    setMessageContent('');
    setMessageDialogState({ open: true, user });
  };

  const handleSendMessage = async () => {
    if (!messageDialogState.user || !messageSubject.trim() || !messageContent.trim()) {
      toast({ title: "Missing Information", description: "Subject and message content are required.", variant: "destructive"});
      return;
    }
    const success = await liveSendUserMessage(messageDialogState.user.id, messageSubject, messageContent);
    if (success) {
      setMessageDialogState({ open: false, user: null });
      setMessageSubject('');
      setMessageContent('');
    }
  };
  
  const filteredUsers = useCallback(() => {
    if (!allUsers || usersLoading) return [];
    return searchUsersHook(allUsers, userSearchTerm, userFilterStatus, userFilterRole);
  }, [allUsers, userSearchTerm, userFilterStatus, userFilterRole, searchUsersHook, usersLoading]);


  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Stats Overview and Quick Actions combined
  const StatsAndQuickActions = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Listeners</p>
                <p className="text-2xl font-bold">1.2M</p> {/* Example static data */}
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last month
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
        
        <Card className={`border-l-4 ${!statsLoading && dashboardStats.pendingReports > 0 ? 'border-l-red-500' : 'border-l-gray-300 dark:border-l-gray-600'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reports</p>
                <p className={`text-2xl font-bold ${!statsLoading && dashboardStats.pendingReports > 0 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  {statsLoading ? '...' : dashboardStats.pendingReports}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {!statsLoading && dashboardStats.pendingReports > 0 ? 'Needs attention' : 'All clear'}
                </p>
              </div>
              <Flag className={`h-8 w-8 ${!statsLoading && dashboardStats.pendingReports > 0 ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`} />
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

      {/* Quick Actions Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <Button variant="outline" onClick={() => handleQuickAction('new-post')} className="h-20 flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm text-center">New Post</span>
            </Button>
            <Button variant="outline" onClick={() => handleQuickAction('manage-shows')} className="h-20 flex-col gap-2">
              <Radio className="h-6 w-6" />
              <span className="text-sm text-center">Manage Shows</span>
            </Button>
            <Button variant="outline" onClick={() => handleQuickAction('manage-videos')} className="h-20 flex-col gap-2">
              <Video className="h-6 w-6" />
              <span className="text-sm text-center">Featured Videos</span>
            </Button>
             <Button variant="outline" onClick={() => handleQuickAction('manage-users')} className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" /> 
              <span className="text-sm text-center">Manage Users</span>
            </Button>
            <Button 
              variant={!statsLoading && dashboardStats.pendingReports > 0 ? "destructive" : "outline"} 
              onClick={() => handleQuickAction('view-reports')} 
              className="h-20 flex-col gap-2"
            >
              <Flag className="h-6 w-6" />
              <span className="text-sm text-center">
                {!statsLoading && dashboardStats.pendingReports > 0 ? `${dashboardStats.pendingReports} Reports` : 'View Reports'}
              </span>
            </Button>
            {isAdmin && (
              <Button variant="outline" onClick={() => handleQuickAction('manage-staff')} className="h-20 flex-col gap-2">
                <Settings className="h-6 w-6" /> 
                <span className="text-sm text-center">Manage Staff</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getRoleBadge = (role: User['role']) => {
    let variant: "default" | "secondary" | "outline" = "outline";
    if (role === 'admin') variant = 'default';
    else if (role === 'moderator') variant = 'secondary';
    return <Badge variant={variant} className="capitalize">{role}</Badge>;
  };

  const getStatusBadge = (status: User['status']) => {
    let className = "capitalize text-white ";
    if (status === 'active') className += 'bg-green-500 hover:bg-green-600';
    else if (status === 'suspended') className += 'bg-yellow-500 hover:bg-yellow-600';
    else if (status === 'banned') className += 'bg-red-500 hover:bg-red-600';
    return <Badge className={className}>{status}</Badge>;
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
        <div className="space-y-8">
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
                  if(refreshUsers) refreshUsers(); 
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

          <StatsAndQuickActions />

          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <div className="border-b dark:border-gray-700">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 h-auto p-1 bg-muted dark:bg-gray-800 rounded-md">
                <TabsTrigger value="content" className="flex items-center gap-2 py-2.5 sm:py-3 data-[state=active]:bg-background dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Content</span>
                   <span className="sm:hidden">Content</span>
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex items-center gap-2 py-2.5 sm:py-3 data-[state=active]:bg-background dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm">
                  <Video className="h-4 w-4" />
                  <span className="hidden sm:inline">Videos</span>
                  <span className="sm:hidden">Videos</span>
                </TabsTrigger>
                <TabsTrigger value="shows" className="flex items-center gap-2 py-2.5 sm:py-3 data-[state=active]:bg-background dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm">
                  <Radio className="h-4 w-4" />
                  <span className="hidden sm:inline">Shows</span>
                  <span className="sm:hidden">Shows</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2 py-2.5 sm:py-3 data-[state=active]:bg-background dark:data-[state=active]:bg-gray-950 data-[state=active]:shadow-sm">
                  <Users className="h-4 w-4" /> 
                  <span className="hidden sm:inline">Users</span>
                  <span className="sm:hidden">Users</span>
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

            <TabsContent value="videos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Featured Videos Management
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage YouTube videos displayed in the Hero section and Featured Music Videos gallery.
                  </p>
                </CardHeader>
                <CardContent>
                  <HomeSettingsProvider>
                    <VideosTabContent />
                  </HomeSettingsProvider>
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

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    View, manage, and moderate community members.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative sm:flex-grow">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search users (name, email)..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-8 w-full"
                      />
                    </div>
                    <Select value={userFilterStatus} onValueChange={(value) => setUserFilterStatus(value as User['status'] | 'all')}>
                      <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={userFilterRole} onValueChange={(value) => setUserFilterRole(value as User['role'] | 'all')}>
                      <SelectTrigger className="w-full sm:w-[140px]">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                     <Button 
                        variant="outline" 
                        size="icon"
                        onClick={refreshUsers}
                        className="shrink-0"
                        title="Refresh user list"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span className="sr-only">Refresh Users</span>
                      </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                          <p className="text-sm text-muted-foreground">Total Users</p>
                          <p className="text-2xl font-bold">{usersLoading ? '...' : allUsers.length}</p>
                      </div>
                      <div>
                          <p className="text-sm text-muted-foreground">Active</p>
                          <p className="text-2xl font-bold text-green-600">{usersLoading ? '...' : allUsers.filter(u=>u.status === 'active').length}</p>
                      </div>
                      <div>
                          <p className="text-sm text-muted-foreground">Suspended</p>
                          <p className="text-2xl font-bold text-yellow-600">{usersLoading ? '...' : allUsers.filter(u=>u.status === 'suspended').length}</p>
                      </div>
                      <div>
                          <p className="text-sm text-muted-foreground">Banned</p>
                          <p className="text-2xl font-bold text-red-600">{usersLoading ? '...' : allUsers.filter(u=>u.status === 'banned').length}</p>
                      </div>
                  </div>
                  <Separator />
                  {usersError && (
                    <div className="text-red-500 p-4 border border-red-500 bg-red-50 rounded-md">
                      Error loading users: {usersError}
                    </div>
                  )}
                  <UserTable
                    users={filteredUsers()}
                    isLoading={usersLoading}
                    onOpenActionDialog={openUserActionDialog}
                    onOpenMessageDialog={openMessageDialog}
                    getRoleBadge={getRoleBadge}
                    getStatusBadge={getStatusBadge}
                  />
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
                          id: `reporter-${report.reporter_name}-${report.id}`, 
                          name: report.reporter_name,
                          avatar: report.reporter_avatar || '/placeholder.svg'
                        },
                        author: {
                          id: `author-${report.reported_user_name}-${report.id}`, 
                          name: report.reported_user_name,
                          avatar: report.reported_user_avatar || '/placeholder.svg',
                          joinDate: new Date().toISOString(), 
                          postCount: 0, 
                          previousFlags: 0 
                        },
                        timestamp: report.created_at,
                        topic: {
                          id: report.topic_id || `topic-${report.id}`, 
                          title: report.topic_title || 'Unknown Topic',
                          category: 'General' 
                        },
                        status: report.status,
                        resolution: report.action_type ? {
                          action: report.action_type,
                          moderator: report.moderator_name || 'Unknown',
                          timestamp: report.action_created_at || new Date().toISOString(),
                          note: report.action_note || ''
                        } : undefined,
                        reportedUserId: report.reported_user_id, 
                        topicId: report.topic_id
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
      
      <ManageStaffModal 
        open={isManageStaffOpen}
        onOpenChange={setIsManageStaffOpen}
        currentUserRole={userRole || ''}
      />
      
      <StaffProfileEditor
        open={isProfileEditorOpen}
        onOpenChange={setIsProfileEditorOpen}
      />

      <UserActionDialog
        isOpen={userActionDialogState.open}
        onOpenChange={(open) => setUserActionDialogState(prev => ({ ...prev, open }))}
        action={userActionDialogState.action}
        user={userActionDialogState.user}
        reason={actionReason}
        onReasonChange={setActionReason}
        onConfirm={handleUserAction}
        isConfirmDisabled={!actionReason.trim()}
      />

      <SendMessageDialog
        isOpen={messageDialogState.open}
        onOpenChange={(open) => setMessageDialogState(prev => ({ ...prev, open }))}
        user={messageDialogState.user}
        subject={messageSubject}
        onSubjectChange={setMessageSubject}
        content={messageContent}
        onContentChange={setMessageContent}
        onConfirm={handleSendMessage}
        isConfirmDisabled={!messageSubject.trim() || !messageContent.trim()}
      />

      {selectedReportData && (
        <ReportDetails
          reportData={{
            id: selectedReportData.id,
            contentType: selectedReportData.content_type as 'post' | 'topic',
            contentId: selectedReportData.content_id,
            content: selectedReportData.content_preview || 'No content preview available.',
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
            } : undefined,
            reportedUserId: selectedReportData.reported_user_id,
            topicId: selectedReportData.topic_id,
          }}
          onClose={() => setSelectedFlagId(null)}
          onAction={handleModerationAction}
          moderationNote={moderationNote}
          setModerationNote={setModerationNote}
        />
      )}
    </>
  );
};

export default UnifiedStaffDashboard;
