
import React, { useState } from "react";
import { useStaffRole } from "@/hooks/useStaffRole";
import { useModerationStats } from "@/hooks/moderation/useModerationStats";
import { useContentReports, ContentReport } from "@/hooks/moderation/useContentReports";
import TitleUpdater from "@/components/TitleUpdater";
import ModerationPageHeader from "@/components/staff/moderator-dashboard/ModerationPageHeader";
import ModerationTabs from "@/components/staff/moderator-dashboard/ModerationTabs";
import AccessDeniedCard from "@/components/staff/moderator-dashboard/AccessDeniedCard";
import { useReportActions } from "@/components/staff/moderator-dashboard/hooks/useReportActions";
import { DashboardStats, Report } from "@/components/staff/moderator-dashboard/types";

const StaffModerationPage = () => {
  const { staffName, userRole, isLoading } = useStaffRole();
  const { stats, loading: statsLoading, refreshStats } = useModerationStats();
  const { 
    reports, 
    loading: reportsLoading, 
    fetchReports 
  } = useContentReports();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { moderationNote, setModerationNote, handleReportAction } = useReportActions();

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
    return <AccessDeniedCard />;
  }

  return (
    <>
      <TitleUpdater />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <ModerationPageHeader />
        
        <ModerationTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dashboardStats={dashboardStats}
          filteredReports={filteredReports}
          selectedFlag={selectedFlag}
          setSelectedFlag={setSelectedFlag}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onRefresh={handleRefresh}
          onReportAction={handleReportAction}
          moderationNote={moderationNote}
          setModerationNote={setModerationNote}
        />
      </main>
    </>
  );
};

export default StaffModerationPage;
