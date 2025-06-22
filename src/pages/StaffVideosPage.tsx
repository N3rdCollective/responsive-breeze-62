
import React from "react";
import { useStaffRole } from "@/hooks/useStaffRole";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import AccessDenied from "@/components/staff/news/AccessDenied";
import TitleUpdater from "@/components/TitleUpdater";
import { HomeSettingsProvider } from "@/components/staff/home/context/HomeSettingsContext";
import VideosTabContent from "@/components/staff/home/components/VideosTabContent";

const StaffVideosPage = () => {
  const { userRole, isLoading, staffName } = useStaffRole();
  
  // Check if user has appropriate permissions
  const canManageVideos = userRole === "admin" || userRole === "moderator" || userRole === "staff" || userRole === "super_admin";
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!canManageVideos) {
    return <AccessDenied />;
  }
  
  return (
    <HomeSettingsProvider>
      <TitleUpdater title="Featured Videos Management" />
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Featured Videos Management</h1>
            <p className="text-muted-foreground">
              Manage featured videos displayed on the homepage
            </p>
          </div>
        </div>

        <VideosTabContent />
      </div>
    </HomeSettingsProvider>
  );
};

export default StaffVideosPage;
