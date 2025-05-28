
import React from "react";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import StaffHeader from "@/components/staff/StaffHeader";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import ActivityLogs from "@/components/staff/activity/ActivityLogs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StaffActivityLogs = () => {
  const { staffName, isAdmin, isLoading, userRole } = useStaffAuth();
  const navigate = useNavigate();
  const hasAccess = isAdmin || userRole === "super_admin" || userRole === "moderator";

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!hasAccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/staff')}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Staff Dashboard
          </Button>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-400">
            Access Denied
          </h2>
          <p className="mt-2 text-red-700 dark:text-red-300">
            You don't have permission to view activity logs.
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/staff')}
            className="mt-4"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/staff')}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Staff Dashboard
        </Button>
      </div>
      
      <div className="space-y-8">
        <StaffHeader 
          staffName={staffName} 
          isAdmin={isAdmin} 
          title="Staff Activity Logs" 
        />
        
        <ActivityLogs />
      </div>
    </div>
  );
};

export default StaffActivityLogs;
