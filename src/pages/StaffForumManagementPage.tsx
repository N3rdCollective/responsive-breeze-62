
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StaffHeader from "@/components/staff/StaffHeader";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoryManagement from "@/components/staff/forum/CategoryManagement";
import TopicManagement from "@/components/staff/forum/TopicManagement";

const StaffForumManagementPage = () => {
  const { staffName, isAdmin, isLoading, userRole, handleLogout } = useStaffAuth({ redirectUnauthorized: true });
  const [activeTab, setActiveTab] = useState("categories");
  
  // Check if user has permission to access this page
  const canManageForum = userRole === 'admin' || userRole === 'super_admin' || userRole === 'moderator';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-128px)]">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }
  
  // If user doesn't have permission, show access denied message
  if (!canManageForum) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <StaffHeader
            title="Access Denied"
            staffName={staffName}
            isAdmin={isAdmin}
            showLogoutButton={true}
            onLogout={handleLogout}
          />
          <div className="mt-8 p-8 border border-destructive/20 rounded-lg bg-destructive/5 text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">Permission Denied</h2>
            <p className="text-muted-foreground">
              You don't have the necessary permissions to manage the forum.
              Please contact an administrator if you believe this is an error.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <StaffHeader
          title="Forum Management"
          staffName={staffName}
          isAdmin={isAdmin}
          showLogoutButton={true}
          onLogout={handleLogout}
        />
        
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-[400px] mb-6">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="categories" className="mt-0">
              <CategoryManagement userRole={userRole} />
            </TabsContent>
            
            <TabsContent value="topics" className="mt-0">
              <TopicManagement userRole={userRole} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StaffForumManagementPage;
