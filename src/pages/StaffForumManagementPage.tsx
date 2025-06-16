
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStaffRole } from "@/hooks/useStaffRole";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, 
  ArrowLeft,
  Settings,
  List
} from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";
import CategoryManagement from "@/components/staff/forum/CategoryManagement";
import TopicManagement from "@/components/staff/forum/TopicManagement";

const StaffForumManagementPage = () => {
  const navigate = useNavigate();
  const { staffName, userRole, isLoading } = useStaffRole();
  const [activeTab, setActiveTab] = useState("categories");

  // Check if user has appropriate permissions
  const canManageForum = userRole === "admin" || userRole === "moderator" || userRole === "super_admin";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-128px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading Forum Management...</p>
        </div>
      </div>
    );
  }

  if (!canManageForum) {
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
                You don't have permission to access forum management tools. 
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
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="break-words">Forum Management</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage forum categories, topics, and community discussions.
            </p>
          </div>
        </div>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Topics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            <CategoryManagement userRole={userRole} />
          </TabsContent>

          <TabsContent value="topics" className="space-y-6">
            <TopicManagement userRole={userRole} />
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
};

export default StaffForumManagementPage;
