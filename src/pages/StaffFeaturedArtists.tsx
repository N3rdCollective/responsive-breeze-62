
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import StaffHeader from "@/components/staff/StaffHeader";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import FeaturedArtistManager from "@/components/staff/featured-artists/FeaturedArtistManager";
import { useStaffActivityLogger } from "@/hooks/useStaffActivityLogger";

const StaffFeaturedArtistsPage = () => {
  const { userRole, isLoading, staffName, isAdmin } = useStaffAuth();
  const navigate = useNavigate();
  const logger = useStaffActivityLogger();
  
  const isModeratorOrHigher = userRole === "admin" || userRole === "moderator" || userRole === "super_admin";
  
  useEffect(() => {
    if (!isLoading && isModeratorOrHigher) {
      logger.logActivity(
        "visit",
        "Visited featured artists management page",
        undefined,
        undefined,
        { page: "featured_artists_management" }
      );
    }
  }, [isLoading, isModeratorOrHigher, logger]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!isModeratorOrHigher) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <StaffHeader title="Access Denied" />
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-400">
            Insufficient permissions
          </h2>
          <p className="mt-2 text-red-700 dark:text-red-300">
            You don't have permission to manage featured artists.
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
    <div className="container mx-auto p-4 max-w-5xl">
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
      
      <StaffHeader 
        title="Featured Artists Management" 
        staffName={staffName}
        isAdmin={isAdmin}
      />
      
      <div className="mt-6">
        <FeaturedArtistManager />
      </div>
    </div>
  );
};

export default StaffFeaturedArtistsPage;
