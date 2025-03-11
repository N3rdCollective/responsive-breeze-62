
import React from "react";
import { useNavigate } from "react-router-dom";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import StaffHeader from "@/components/staff/StaffHeader";
import AdminCard from "@/components/staff/AdminCard";
import ContentManagementCard from "@/components/staff/ContentManagementCard";
import ShowManagementCard from "@/components/staff/ShowManagementCard";
import StatsPanel from "@/components/staff/StatsPanel";
import LoadingSpinner from "@/components/staff/LoadingSpinner";

const StaffDashboard = () => {
  const { userRole, isLoading, staffName, isAdmin, handleLogout } = useStaffAuth();
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <StaffHeader 
        title="Staff Dashboard" 
        staffName={staffName}
        isAdmin={isAdmin}
        showLogoutButton
        onLogout={handleLogout}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <ContentManagementCard userRole={userRole} />
        
        <div className="space-y-6">
          <ShowManagementCard userRole={userRole} />
          
          {isAdmin && <AdminCard />}
        </div>
      </div>
      
      <div className="mt-8">
        <StatsPanel />
      </div>
    </div>
  );
};

export default StaffDashboard;
