
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStaffRole } from "@/hooks/useStaffRole";
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
import { DashboardStats, Report } from "@/components/staff/moderator-dashboard/types";

const StaffModerationPage = () => {
  const navigate = useNavigate();
  const { staffName, userRole, isLoading } = useStaffRole();
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    pendingReports: 0,
    resolvedToday: 0,
    newMembers: 0,
    activeTopics: 0,
    topCategories: [],
    flaggedUsers: []
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Check if user has appropriate permissions
  const canModerate = userRole === "admin" || userRole === "moderator" || userRole === "super_admin";

  useEffect(() => {
    if (canModerate) {
      loadModerationData();
    }
  }, [canModerate]);

  const loadModerationData = async () => {
    // Mock data for now - this would connect to real Supabase data
    const mockStats: DashboardStats = {
      pendingReports: 12,
      resolvedToday: 8,
      newMembers: 25,
      activeTopics: 156,
      topCategories: [
        { name: "General Discussion", count: 45 },
        { name: "Music Chat", count: 32 },
        { name: "Artist Spotlight", count: 28 },
        { name: "Tech Support", count: 15 }
      ],
      flaggedUsers: [
        { name: "user123", flags: 3 },
        { name: "troublemaker", flags: 7 },
        { name: "spammer001", flags: 5 }
      ]
    };

    const mockReports: Report[] = [
      {
        id: "1",
        contentType: "post",
        contentId: "post-123",
        content: "Spam content that violates community guidelines",
        reportReason: "Spam content",
        status: "pending",
        timestamp: "2024-01-15T10:30:00Z",
        author: { 
          id: "user-1",
          name: "John Doe", 
          avatar: "/api/placeholder/32/32",
          joinDate: "2024-01-01T00:00:00Z",
          postCount: 15,
          previousFlags: 0
        },
        reporter: { 
          id: "user-2",
          name: "Jane Smith", 
          avatar: "/api/placeholder/32/32" 
        },
        topic: { 
          id: "topic-1",
          title: "Weekly Music Discussion",
          category: "Music Chat"
        },
        reportedUserId: "user-1",
        topicId: "topic-1"
      },
      {
        id: "2", 
        contentType: "topic",
        contentId: "topic-2",
        content: "Topic with inappropriate language and offensive content",
        reportReason: "Inappropriate language",
        status: "pending",
        timestamp: "2024-01-15T09:15:00Z",
        author: { 
          id: "user-3",
          name: "BadUser", 
          avatar: "/api/placeholder/32/32",
          joinDate: "2024-01-10T00:00:00Z",
          postCount: 5,
          previousFlags: 2
        },
        reporter: { 
          id: "user-4",
          name: "ModUser", 
          avatar: "/api/placeholder/32/32" 
        },
        topic: { 
          id: "topic-2",
          title: "Offensive Topic Title",
          category: "General Discussion"
        },
        reportedUserId: "user-3",
        topicId: "topic-2"
      }
    ];

    setDashboardStats(mockStats);
    setReports(mockReports);
  };

  const filteredReports = reports.filter(report => {
    const statusMatch = filterStatus === 'all' || report.status === filterStatus;
    const searchMatch = !searchTerm || 
      report.topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportReason.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  if (isLoading) {
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
            />
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
