
import React from "react";
import { useStaffRole } from "@/hooks/useStaffRole";
import SponsorsManagement from "@/components/staff/sponsors/SponsorsManagement";
import StaffHeader from "@/components/staff/StaffHeader";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import { Navigate } from "react-router-dom";

const StaffSponsors = () => {
  const { staffName, isAdmin, isLoading, userRole } = useStaffRole();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Check authentication
  const isAuthenticated = userRole !== "";
  
  if (!isAuthenticated) {
    return <Navigate to="/staff/login" />;
  }

  // Only admin, moderator, and super_admin roles can access this page
  const canManageSponsors = userRole === "admin" || userRole === "moderator" || userRole === "super_admin";
  
  if (!canManageSponsors) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-16">
          <div className="flex flex-col items-center justify-center pt-16">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You do not have permission to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="space-y-8">
        <StaffHeader staffName={staffName} isAdmin={isAdmin} />
        <SponsorsManagement />
      </div>
    </div>
  );
};

export default StaffSponsors;
