
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Flag, Users } from 'lucide-react';
import DashboardOverview from './DashboardOverview';
import ReportedContentSection from './ReportedContentSection';
import ReportDetails from './ReportDetails';
import { DashboardStats, Report } from './types';

interface ModerationTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dashboardStats: DashboardStats;
  filteredReports: Report[];
  selectedFlag: string | null;
  setSelectedFlag: (id: string | null) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRefresh: () => void;
  onReportAction: (
    action: string, 
    reportId: string,
    details?: { 
      reportedUserId?: string;
      contentId?: string;
      contentType?: 'post' | 'topic';
      topicId?: string;
    }
  ) => Promise<void>;
  moderationNote: string;
  setModerationNote: (note: string) => void;
}

const ModerationTabs: React.FC<ModerationTabsProps> = ({
  activeTab,
  setActiveTab,
  dashboardStats,
  filteredReports,
  selectedFlag,
  setSelectedFlag,
  filterStatus,
  setFilterStatus,
  searchTerm,
  setSearchTerm,
  onRefresh,
  onReportAction,
  moderationNote,
  setModerationNote
}) => {
  const navigate = useNavigate();
  
  const selectedReport = selectedFlag ? filteredReports.find(r => r.id === selectedFlag) : null;
  const canShowReportDetails = selectedReport && (selectedReport.contentType === 'post' || selectedReport.contentType === 'topic');

  return (
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
          onRefresh={onRefresh}
        />
        
        {canShowReportDetails && selectedReport && (
          <ReportDetails
            reportData={{
              ...selectedReport,
              contentType: selectedReport.contentType as 'post' | 'topic',
              reportedUserId: selectedReport.reportedUserId,
              contentId: selectedReport.contentId,
              topicId: selectedReport.topicId
            }}
            onClose={() => setSelectedFlag(null)}
            onAction={(action, reportId, details) => {
              return onReportAction(action, reportId, details);
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
  );
};

export default ModerationTabs;
