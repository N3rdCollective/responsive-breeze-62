
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import SponsorsManagement from "@/components/staff/sponsors/SponsorsManagement";
import StaffHeader from "@/components/staff/StaffHeader";
import LoadingSpinner from "@/components/staff/LoadingSpinner";

const StaffSponsors = () => {
  const { staffName, isAdmin, isLoading, userRole } = useStaffAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Only admin, moderator, and super_admin roles can access this page
  const canManageSponsors = userRole === "admin" || userRole === "moderator" || userRole === "super_admin";
  
  if (!canManageSponsors) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
          <div className="flex flex-col items-center justify-center pt-16">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You do not have permission to access this page.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="space-y-8">
          <StaffHeader staffName={staffName} isAdmin={isAdmin} />
          <SponsorsManagement />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StaffSponsors;
