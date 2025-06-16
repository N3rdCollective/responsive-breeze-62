
import { useState } from "react";
import { useStaffRole } from "@/hooks/useStaffRole";
import StaffHeader from "@/components/staff/StaffHeader";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import SystemSettingsForm from "@/components/staff/settings/SystemSettingsForm";
import AccessDenied from "@/components/staff/news/AccessDenied";

const StaffSystemSettings = () => {
  const { staffName, isAdmin, isLoading, userRole } = useStaffRole();
  const hasAccess = isAdmin || userRole === "super_admin";

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasAccess) {
    return <AccessDenied />;
  }

  return (
    <div className="space-y-8">
      <StaffHeader 
        staffName={staffName} 
        isAdmin={isAdmin} 
        title="System Settings" 
      />
      
      <SystemSettingsForm />
    </div>
  );
};

export default StaffSystemSettings;
