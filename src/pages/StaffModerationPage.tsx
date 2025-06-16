
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStaffRole } from "@/hooks/useStaffRole";
import { useModerationStats } from "@/hooks/moderation/useModerationStats";
import { useContentReports } from "@/hooks/moderation/useContentReports";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShieldCheck, 
  ArrowLeft,
  BarChart3,
  Flag,
  Users
} from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";
import DashboardOverview from "@/components/staff/moderator-dashboard/DashboardOverview";
import ReportedContentSection from "@/components/staff/moderator-dashboard/ReportedContentSection";
import ReportDetails from "@/components/staff/moderator-dashboard/ReportDetails";
import { DashboardStats, Report } from "@/components/staff/moderator-dashboard/types";
import { ContentReport } from "@/hooks/moderation/useContentReports";

const StaffModerationPage = () => {
  const navigate = useNavigate();
  const { staffName, userRole, isLoading } = useStaffRole();
  const { stats, loading: statsLoading, refreshStats } = useModerationStats();
  const { 
    reports, 
    loading: reportsLoading, 
    updateReportStatus, 
    createModerationAction,
    removeContentOnDb,
    lockTopicOnDb,
    fetchReports 
  } = useContentReports();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [moderationNote, setModerationNote] = useState("");

  // Check if user has appropriate permissions
  const canModerate = userRole === "admin" || userRole === "moderator" || userRole === "super_admin";

  // Convert ContentReport to Report format for UI components
  const convertToReportFormat = (contentReport: ContentReport): Report => {
    return {
      id: contentReport.id,
      contentType: contentReport.content_type as 'post' | 'topic' | 'user',
      contentId: contentReport.content_id,
      content: contentReport.content_preview || '',
      reportReason: contentReport.report_reason,
      status: contentReport.status,
      timestamp: contentReport.created_at,
      author: {
        id: contentReport.reported_user_id,
        name: contentReport.reported_user_name,
        avatar: contentReport.reported_user_avatar || '/api/placeholder/32/32',
        joinDate: new Date().toISOString(), // Placeholder - could be enhanced
        postCount: 0, // Placeholder - could be enhanced
        previousFlags: 0 // Placeholder - could be enhanced
      },
      reporter: {
        id: 'reporter-id', // Placeholder
        name: contentReport.reporter_name,
        avatar: contentReport.reporter_avatar || '/api/placeholder/32/32'
      },
      topic: {
        id: contentReport.topic_id || '',
        title: contentReport.topic_title || 'Unknown Topic',
        category: 'General' // Placeholder - could be enhanced
      },
      reportedUserId: contentReport.reported_user_id,
      topicId: contentReport.topic_id || undefined,
      resolution: contentReport.action_type ? {
        action: contentReport.action_type,
        moderator: contentReport.moderator_name || 'Unknown',
        timestamp: contentReport.action_created_at || new Date().toISOString(),
        note: contentReport.action_note || ''
      } : undefined
    };
  };

  // Convert reports to UI format
  const convertedReports = reports.map(convertToReportFormat);

  // Convert stats to UI format
  const dashboardStats: DashboardStats = {
    pendingReports: stats.pendingReports,
    resolvedToday: stats.resolvedToday,
    newMembers: stats.newMembers,
    activeTopics: stats.activeTopics,
    topCategories: stats.topCategories,
    flaggedUsers: stats.flaggedUsers
  };

  const filteredReports = convertedReports.filter(report => {
    const statusMatch = filterStatus === 'all' || report.status === filterStatus;
    const searchMatch = !searchTerm || 
      report.topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportReason.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  const handleReportAction = async (
    action: string, 
    reportId: string,
    details?: { 
      reportedUserId?: string;
      contentId?: string;
      contentType?: 'post' | 'topic';
      topicId?: string;
    }
  ) => {
    try {
      switch (action) {
        case 'dismiss':
        case 'reopen':
          const newStatus = action === 'dismiss' ? 'rejected' : 'pending';
          await updateReportStatus(reportId, newStatus);
          break;
          
        case 'remove_content':
          if (details?.contentId && details?.contentType) {
            await removeContentOnDb(details.contentId, details.contentType);
            await createModerationAction(reportId, 'content_removed', moderationNote);
            await updateReportStatus(reportId, 'resolved');
          }
          break;
          
        case 'lock_topic':
          if (details?.topicId) {
            await lockTopicOnDb(details.topicId);
            await createModerationAction(reportId, 'topic_locked', moderationNote);
            await updateReportStatus(reportId, 'resolved');
          }
          break;
          
        case 'warn_user':
          await createModerationAction(reportId, 'user_warned', moderationNote);
          await updateReportStatus(reportId, 'resolved');
          break;
          
        case 'ban_user':
          if (moderationNote.trim()) {
            await createModerationAction(reportId, 'user_banned', moderationNote);
            await updateReportStatus(reportId, 'resolved');
          }
          break;
          
        default:
          await createModerationAction(reportId, action, moderationNote);
          await updateReportStatus(reportId, 'resolved');
      }
      
      // Clear the moderation note and refresh data
      setModerationNote("");
      setSelectedFlag(null);
      await fetchReports();
      await refreshStats();
      
    } catch (error) {
      console.error('Error handling report action:', error);
    }
  };

  const handleRefresh = async () => {
    await fetchReports();
    await refreshStats();
  };

  if (isLoading || statsLoading || reportsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-128px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading Moderation Tools...</p>
        </div>
      </div>
    );
  }

  if (!canModerate) {
    return (
      <>
        <TitleUpdater />
        <main className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <div className="order-2 sm:order-1">
              <Button variant="outline" size="sm" onClick={() => navigate('/staff/panel')} className="w-full sm:w-auto">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Staff Panel
              </Button>
            </div>
          </div>
          <Card className="border-destructive/50 bg-destructive/5 dark:bg-destructive/10">
            <CardHeader>
              <CardTitle className="text-destructive">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You don't have permission to access moderation tools. 
                Contact an administrator if you believe this is an error.
              </p>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  const selectedReport = selectedFlag ? filteredReports.find(r => r.id === selectedFlag) : null;

  return (
    <>
      <TitleUpdater />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="order-2 sm:order-1">
            <Button variant="outline" size="sm" onClick={() => navigate('/staff/panel')} className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Staff Panel
            </Button>
          </div>
          <div className="text-center sm:text-right order-1 sm:order-2 w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 justify-center sm:justify-end">
              <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="break-words">Moderation Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Monitor and moderate community content and user behavior.
            </p>
          </div>
        </div>

        {/* Moderation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview dashboardStats={dashboardStats} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportedContentSection
              filteredReports={filteredReports}
              selectedFlag={selectedFlag}
              setSelectedFlag={setSelectedFlag}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onRefresh={handleRefresh}
            />
            
            {selectedReport && (
              <ReportDetails
                reportData={selectedReport}
                onClose={() => setSelectedFlag(null)}
                onAction={(action, reportId, details) => {
                  // Filter out user content type for actions that require specific content types
                  const filteredDetails = details && selectedReport.contentType !== 'user' ? {
                    ...details,
                    contentType: selectedReport.contentType as 'post' | 'topic'
                  } : undefined;
                  
                  return handleReportAction(action, reportId, filteredDetails);
                }}
                moderationNote={moderationNote}
                setModerationNote={setModerationNote}
              />
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  User management tools are integrated into the main Staff Panel under User Management.
                </p>
                <Button onClick={() => navigate('/staff/users')}>
                  Go to User Management
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
};

export default StaffModerationPage;
