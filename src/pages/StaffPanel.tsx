
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import UnifiedDashboard from "@/components/staff/UnifiedDashboard";
import LoadingSpinner from "@/components/staff/LoadingSpinner";

const StaffPanel = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <UnifiedDashboard />;
};

export default StaffPanel;
