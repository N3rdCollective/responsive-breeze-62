
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useStaffRole } from "@/hooks/useStaffRole";
import NewsHeader from "@/components/staff/news/NewsHeader";
import NewsListTable from "@/components/staff/news/NewsListTable";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import AccessDenied from "@/components/staff/news/AccessDenied";

const StaffNewsPage = () => {
  const { userRole, isLoading, staffName, isAdmin } = useStaffRole();
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);
  const handleLogout = () => {
    // Handle logout logic here
    navigate('/staff/login');
  };
  
  // Check if user has appropriate permissions
  const canManageNews = userRole === "admin" || userRole === "moderator" || userRole === "staff" || userRole === "super_admin" || userRole === "blogger";
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!canManageNews) {
    return <AccessDenied />;
  }
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/staff/panel')}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Staff Dashboard
        </Button>
      </div>
      
      <NewsHeader 
        title="News Management" 
        staffName={staffName}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
      
      <div className="mb-6 flex justify-end">
        <Button 
          onClick={() => navigate("/staff/news/editor")} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New Post
        </Button>
      </div>
      
      <NewsListTable 
        refreshTrigger={refreshTrigger} 
        onPostStatusChange={handleRefresh}
      />
    </div>
  );
};

export default StaffNewsPage;
