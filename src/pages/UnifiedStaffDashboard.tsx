import React, { useState, useEffect, useCallback } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  // DialogTrigger, // Not used in the provided code
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// import { AlertCircle, CheckCircle, Clock } from "lucide-react"; // Not used
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
  Eye,
  RefreshCw,
  Search,
  MoreHorizontal,
  Ban,
  UserCheck,
  UserX,
  // Calendar, // Not used
  Mail,
  MessageSquare
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
import { useContentReports, ContentReport } from '@/hooks/moderation/useContentReports';
import { useModerationStats } from '@/hooks/moderation/useModerationStats';
import { useUserManagement, User } from '@/hooks/admin/useUserManagement'; // Updated import

const UnifiedStaffDashboard = () => {
  const { toast } = useToast();
  const [isManageStaffOpen, setIsManageStaffOpen] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const { staffName, isAdmin, isLoading: authLoading, handleLogout, userRole } = useStaffAuth();
  
  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab') || 'overview';
  });
  
  // Moderation dashboard state
  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all'); // For content reports
  const [searchTerm, setSearchTerm] = useState(''); // For content reports
  const [moderationNote, setModerationNote] = useState('');
  
  const { reports, loading: reportsLoading, updateReportStatus, createModerationAction } = useContentReports();
  const { stats: dashboardStats, loading: statsLoading, refreshStats } = useModerationStats();
  
  // User management from live hook
  const { 
    users: allUsers, 
    loading: usersLoading, 
    error: usersError, // Added error state from hook
    updateUserStatus: liveUpdateUserStatus, 
    sendUserMessage: liveSendUserMessage, 
    searchUsers: searchUsersHook,
    refreshUsers 
  } = useUserManagement();
  
  // User management UI state
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilterStatus, setUserFilterStatus] = useState<'all' | 'active' | 'suspended' | 'banned'>('all');
  const [userFilterRole, setUserFilterRole] = useState<'all' | 'user' | 'moderator' | 'admin'>('all');
  
  const [userActionDialog, setUserActionDialog] = useState<{
    open: boolean;
    action: 'suspend' | 'ban' | 'unban' | null;
    user: User | null;
  }>({ open: false, action: null, user: null });
  const [actionReason, setActionReason] = useState('');
  
  const [messageDialog, setMessageDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');

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
      const actionSuccess = await createModerationAction(reportId, action, moderationNote);
      
      if (actionSuccess) {
        let newStatus: 'resolved' | 'rejected' = 'resolved';
        if (action === 'dismiss') {
          newStatus = 'rejected';
        }
        
        const updateSuccess = await updateReportStatus(reportId, newStatus);
        
        if (updateSuccess) {
          setSelectedFlagId(null);
          setModerationNote('');
          if (refreshStats) refreshStats();
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
        window.location.href = '/staff/news/editor'; 
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
      case 'manage-users': 
        setActiveTab('users');
        break;
      default:
        break;
    }
  };
  
  const selectedReportData = selectedFlagId ? reports.find(r => r.id === selectedFlagId) : null;

  const openUserActionDialog = (action: 'suspend' | 'ban' | 'unban', user: User) => {
    setUserActionDialog({ open: true, action, user });
    setActionReason(''); 
  };

  const handleUserAction = async () => { // Removed parameters, will use state
    if (!userActionDialog.user || !userActionDialog.action || !actionReason.trim()) {
      toast({ title: "Missing Information", description: "A reason is required for this action.", variant: "destructive"});
      return;
    }
    
    const { user, action } = userActionDialog;
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
      let toastTitle = '';
      let toastDescription = '';
      const userName = user.display_name || 'User';

      switch (action) {
          case 'suspend':
              toastTitle = 'User Suspended';
              toastDescription = `${userName} has been suspended.`;
              break;
          case 'ban':
              toastTitle = 'User Banned';
              toastDescription = `${userName} has been banned.`;
              break;
          case 'unban':
              toastTitle = 'User Restored';
              toastDescription = `${userName}'s access has been restored.`;
              break;
      }
      // Toast is already handled in the hook for success/error of updateUserStatus
      // toast({ title: toastTitle, description: toastDescription }); 
      setUserActionDialog({ open: false, action: null, user: null });
      setActionReason('');
      // refreshUsers(); // The hook's updateUserStatus already calls fetchUsers()
    }
    // Error toast is handled within liveUpdateUserStatus hook
  };

  const handleSendMessage = async () => {
    if (!messageDialog.user || !messageSubject.trim() || !messageContent.trim()) {
      toast({ title: "Missing Information", description: "Subject and message content are required.", variant: "destructive"});
      return;
    }
    const success = await liveSendUserMessage(messageDialog.user.id, messageSubject, messageContent);
    if (success) {
      // Toast is handled in the hook
      setMessageDialog({ open: false, user: null });
      setMessageSubject('');
      setMessageContent('');
    }
    // Error toast is handled in the hook
  };
  
  const filteredUsersResult = useCallback(() => {
    if (!allUsers || usersLoading) return [];
    return searchUsersHook(allUsers, userSearchTerm, userFilterStatus, userFilterRole);
  }, [allUsers, userSearchTerm, userFilterStatus, userFilterRole, searchUsersHook, usersLoading]);


  if (authLoading) {
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

  const StatsOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Listeners</p>
                <p className="text-2xl font-bold">1.2M</p>
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

      {activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
               <Button variant="outline" onClick={() => handleQuickAction('manage-users')} className="h-20 flex-col gap-2">
                <Users className="h-6 w-6" /> 
                <span className="text-sm">Manage Users</span>
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
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

          <StatsOverview />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="border-b dark:border-gray-700">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 h-auto p-1 bg-muted dark:bg-gray-800 rounded-md">
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
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={userFilterRole} onValueChange={(value) => setUserFilterRole(value as User['role'] | 'all')}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by role" />
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
                  {usersLoading ? (
                     <div className="flex items-center justify-center py-8">
                       <LoadingSpinner />
                     </div>
                  ) : (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[250px]">User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="hidden md:table-cell">Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden sm:table-cell">Joined</TableHead>
                            <TableHead className="hidden lg:table-cell text-center">Forum Posts</TableHead>
                            <TableHead className="hidden lg:table-cell text-center">Timeline Posts</TableHead>
                            <TableHead className="hidden lg:table-cell text-center">Reports</TableHead>
                            <TableHead className="hidden md:table-cell">Last Active</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsersResult().map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    {user.profile_picture ? (
                                      <img 
                                        src={user.profile_picture} 
                                        alt={user.display_name}
                                        className="w-10 h-10 rounded-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-sm font-medium text-muted-foreground">
                                        {user.display_name?.charAt(0).toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium">{user.display_name}</p>
                                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">{user.email}</TableCell>
                              <TableCell className="hidden md:table-cell">{getRoleBadge(user.role)}</TableCell>
                              <TableCell>{getStatusBadge(user.status)}</TableCell>
                              <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                                {new Date(user.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-center hidden lg:table-cell">{user.forum_post_count ?? 0}</TableCell>
                              <TableCell className="text-center hidden lg:table-cell">{user.timeline_post_count ?? 0}</TableCell>
                              <TableCell className="text-center hidden lg:table-cell">
                                {user.pending_report_count && user.pending_report_count > 0 ? (
                                  <Badge variant="destructive" className="text-xs">
                                    {user.pending_report_count}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">0</span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                                {user.last_active ? new Date(user.last_active).toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => console.log(`View profile: ${user.id}`)}>
                                      <Eye className="mr-2 h-4 w-4" /> View Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => console.log(`View posts: ${user.id}`)}>
                                      <FileText className="mr-2 h-4 w-4" /> View Posts
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setMessageSubject(''); setMessageContent(''); setMessageDialog({ open: true, user });}}>
                                      <Mail className="mr-2 h-4 w-4" /> Send Message
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {user.status === 'active' && (
                                      <>
                                        <DropdownMenuItem 
                                          className="text-yellow-600 focus:text-yellow-700 focus:bg-yellow-100"
                                          onClick={() => openUserActionDialog('suspend', user)}
                                        >
                                          <UserX className="mr-2 h-4 w-4" /> Suspend User
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          className="text-red-600 focus:text-red-700 focus:bg-red-100"
                                          onClick={() => openUserActionDialog('ban', user)}
                                        >
                                          <Ban className="mr-2 h-4 w-4" /> Ban User
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                    {(user.status === 'suspended' || user.status === 'banned') && (
                                      <DropdownMenuItem 
                                        className="text-green-600 focus:text-green-700 focus:bg-green-100"
                                        onClick={() => openUserActionDialog('unban', user)}
                                      >
                                        <UserCheck className="mr-2 h-4 w-4" /> Restore User
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  {filteredUsersResult().length === 0 && !usersLoading && !usersError && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No users found matching your filters.</p>
                    </div>
                  )}
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
      
      <ManageStaffModal 
        open={isManageStaffOpen}
        onOpenChange={setIsManageStaffOpen}
        currentUserRole={userRole || ''}
      />
      
      <StaffProfileEditor
        open={isProfileEditorOpen}
        onOpenChange={setIsProfileEditorOpen}
      />

      {/* User Action Dialog */}
      <Dialog open={userActionDialog.open} onOpenChange={(open) => { if (!open) setUserActionDialog({ open: false, action: null, user: null }); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {userActionDialog.action === 'suspend' && 'Suspend User'}
              {userActionDialog.action === 'ban' && 'Ban User'}
              {userActionDialog.action === 'unban' && 'Restore User Access'}
            </DialogTitle>
            <DialogDescription>
              {userActionDialog.action === 'suspend' && `Temporarily suspend ${userActionDialog.user?.display_name} from the community.`}
              {userActionDialog.action === 'ban' && `Permanently ban ${userActionDialog.user?.display_name} from the community.`}
              {userActionDialog.action === 'unban' && `Restore ${userActionDialog.user?.display_name}'s access to the community.`}
            </DialogDescription>
          </DialogHeader>
          
          {userActionDialog.user && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 dark:bg-muted/20 rounded-lg border">
                 <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {userActionDialog.user.profile_picture ? (
                    <img 
                      src={userActionDialog.user.profile_picture} 
                      alt={userActionDialog.user.display_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium text-muted-foreground">
                      {userActionDialog.user.display_name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{userActionDialog.user.display_name}</p>
                  <p className="text-sm text-muted-foreground">@{userActionDialog.user.username}</p>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="reason" className="text-sm">Reason for action</Label>
                <Textarea
                  id="reason"
                  placeholder={`Enter reason for ${userActionDialog.action === 'unban' ? 'restoring' : userActionDialog.action}...`}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="min-h-[80px]"
                />
                {actionReason.trim().length === 0 && <p className="text-xs text-red-500">A reason is required.</p>}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserActionDialog({ open: false, action: null, user: null })}>
              Cancel
            </Button>
            <Button 
              variant={userActionDialog.action === 'unban' ? 'default' : 'destructive'}
              onClick={handleUserAction} // Updated to call without params
              disabled={!actionReason.trim()}
            >
              {userActionDialog.action === 'suspend' && 'Confirm Suspension'}
              {userActionDialog.action === 'ban' && 'Confirm Ban'}
              {userActionDialog.action === 'unban' && 'Confirm Restoration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={messageDialog.open} onOpenChange={(open) => { if (!open) setMessageDialog({ open: false, user: null }); }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Send Message to {messageDialog.user?.display_name}</DialogTitle>
            <DialogDescription>
              Compose a message to send to @{messageDialog.user?.username}.
            </DialogDescription>
          </DialogHeader>
          {messageDialog.user && (
            <div className="space-y-4 py-4">
               <div className="flex items-center gap-3 p-3 bg-muted/50 dark:bg-muted/20 rounded-lg border">
                 <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  {messageDialog.user.profile_picture ? (
                    <img 
                      src={messageDialog.user.profile_picture} 
                      alt={messageDialog.user.display_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium text-muted-foreground">
                      {messageDialog.user.display_name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold">{messageDialog.user.display_name}</p>
                  <p className="text-sm text-muted-foreground">@{messageDialog.user.username}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message-subject">Subject</Label>
                <Input 
                  id="message-subject" 
                  value={messageSubject} 
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Message subject"
                />
                 {messageSubject.trim().length === 0 && <p className="text-xs text-red-500">Subject is required.</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message-content">Message</Label>
                <Textarea 
                  id="message-content" 
                  value={messageContent} 
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Write your message..."
                  className="min-h-[100px]"
                />
                 {messageContent.trim().length === 0 && <p className="text-xs text-red-500">Message content is required.</p>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialog({ open: false, user: null })}>Cancel</Button>
            <Button onClick={handleSendMessage} disabled={!messageSubject.trim() || !messageContent.trim()}>Send Message</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
