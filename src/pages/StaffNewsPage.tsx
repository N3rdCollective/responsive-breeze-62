
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      <NewsHeader 
        title="News Management" 
        staffName={staffName}
        isAdmin={isAdmin}
      />
      
      <NewsListTable 
        refreshTrigger={refreshTrigger} 
        onPostStatusChange={handleRefresh}
      />
    </div>
  );
};

export default StaffNewsPage;
