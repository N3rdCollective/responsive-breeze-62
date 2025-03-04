
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import StaffHeader from "@/components/staff/StaffHeader";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import SystemSettingsForm from "@/components/staff/settings/SystemSettingsForm";
import AccessDenied from "@/components/staff/news/AccessDenied";

const StaffSystemSettings = () => {
  const { staffName, isAdmin, isLoading, userRole } = useStaffAuth();
  const hasAccess = isAdmin || userRole === "super_admin";

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasAccess) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="space-y-8">
          <StaffHeader 
            staffName={staffName} 
            isAdmin={isAdmin} 
            title="System Settings" 
          />
          
          <SystemSettingsForm />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StaffSystemSettings;
