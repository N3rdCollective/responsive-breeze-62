
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
import { 
  UserCog, 
  BarChart3, 
  Users, 
  FileText, 
  Radio, 
  Shield, 
  Flag,
  Settings,
  TrendingUp
} from "lucide-react";

// Import existing components
import ContentManagementCard from "@/components/staff/ContentManagementCard";
import ShowManagementCard from "@/components/staff/ShowManagementCard";
import AdminCard from "@/components/staff/AdminCard";
import LoadingSpinner from "@/components/staff/LoadingSpinner";

// Import moderator components
import ReportedContentSection from '@/components/staff/moderator-dashboard/ReportedContentSection';
import ReportDetails from '@/components/staff/moderator-dashboard/ReportDetails';
import { reportedContent as allReports, dashboardStats as initialDashboardStats } from '@/data/mockModeratorData';
import { Report } from '@/components/staff/moderator-dashboard/types';

const UnifiedStaffDashboard = () => {
  const { toast } = useToast();
  const [isManageStaffOpen, setIsManageStaffOpen] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const { staffName, isAdmin, isLoading, handleLogout, userRole } = useStaffAuth();
  
  // Moderator dashboard state
  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [moderationNote, setModerationNote] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  const [reportsData, setReportsData] = useState<Report[]>(allReports);
  const [dashboardStats, setDashboardStats] = useState(initialDashboardStats);

  // Update dashboard stats when reports change
  useEffect(() => {
    setDashboardStats(prevStats => ({
      ...prevStats,
      pendingReports: reportsData.filter(r => r.status === 'pending').length,
    }));
  }, [reportsData]);

  const filteredReports = reportsData.filter(report => {
    const statusMatch = filterStatus === 'all' || report.status === filterStatus;
    const searchLower = searchTerm.toLowerCase();
    const termMatch = searchTerm === '' || 
                      report.content.toLowerCase().includes(searchLower) ||
                      report.reportReason.toLowerCase().includes(searchLower) ||
                      report.reporter.name.toLowerCase().includes(searchLower) ||
                      report.author.name.toLowerCase().includes(searchLower) ||
                      report.topic.title.toLowerCase().includes(searchLower);
    return statusMatch && termMatch;
  });

  const handleModerationAction = (action: string, reportId: string) => {
    console.log(`Taking action "${action}" on report ${reportId}`);
    
    if (action === 'dismiss') {
      setReportsData(prevReports => 
        prevReports.map(r => r.id === reportId ? {
          ...r, 
          status: 'rejected', 
          resolution: { 
            action: 'dismiss', 
            moderator: staffName || 'Admin User', 
            timestamp: new Date().toISOString(), 
            note: moderationNote || 'Dismissed without note' 
          }
        } : r)
      );
    } else if (action === 'remove_content') {
      setReportsData(prevReports => 
        prevReports.map(r => r.id === reportId ? {
          ...r, 
          status: 'resolved', 
          resolution: { 
            action: 'remove_content', 
            moderator: staffName || 'Admin User', 
            timestamp: new Date().toISOString(), 
            note: moderationNote || 'Content removed' 
          }
        } : r)
      );
    }

    setSelectedFlagId(null);
    setModerationNote('');
    toast({
      title: "Action completed",
      description: `Report has been ${action === 'dismiss' ? 'dismissed' : 'resolved'}.`,
    });
  };

  const handleManageUsers = () => {
    setIsManageStaffOpen(true);
  };

  const selectedReportData = selectedFlagId ? reportsData.find(r => r.id === selectedFlagId) : null;

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

  // Quick stats component
  const StatsOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Listeners</p>
              <p className="text-2xl font-bold">1.2M</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Shows</p>
              <p className="text-2xl font-bold">45</p>
            </div>
            <Radio className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Reports</p>
              <p className="text-2xl font-bold text-red-500">{dashboardStats.pendingReports}</p>
            </div>
            <Flag className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Staff Members</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold">Staff Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {staffName} {isAdmin && <Badge variant="secondary" className="ml-2">Admin</Badge>}
              </p>
            </div>
            
            <div className="flex gap-2 mt-4 sm:mt-0">
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

          {/* Main Tabbed Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Content
              </TabsTrigger>
              <TabsTrigger value="shows" className="flex items-center gap-2">
                <Radio className="h-4 w-4" />
                Shows
              </TabsTrigger>
              <TabsTrigger value="moderation" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Moderation
                {dashboardStats.pendingReports > 0 && (
                  <Badge variant="destructive" className="ml-1 px-1 min-w-[20px] h-5">
                    {dashboardStats.pendingReports}
                  </Badge>
                )}
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Admin
                </TabsTrigger>
              )}
            </TabsList>

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

            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Content Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContentManagementCard userRole={userRole} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shows">
              <Card>
                <CardHeader>
                  <CardTitle>Show Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <ShowManagementCard />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="moderation">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Content Moderation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReportedContentSection
                      filteredReports={filteredReports}
                      selectedFlag={selectedFlagId}
                      setSelectedFlag={setSelectedFlagId}
                      filterStatus={filterStatus}
                      setFilterStatus={setFilterStatus}
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {isAdmin && (
              <TabsContent value="admin">
                <Card>
                  <CardHeader>
                    <CardTitle>Administration</CardTitle>
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
        currentUserRole={userRole}
      />
      
      <StaffProfileEditor
        open={isProfileEditorOpen}
        onOpenChange={setIsProfileEditorOpen}
      />

      {/* Report Details Modal */}
      {selectedReportData && (
        <ReportDetails
          reportData={selectedReportData}
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
