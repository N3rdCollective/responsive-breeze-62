
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ManageStaffModal from "@/components/ManageStaffModal";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import StaffProfileEditor from "@/components/staff/StaffProfileEditor";
import { Button } from "@/components/ui/button";
import { UserCog } from "lucide-react";

// Import components
import StaffHeader from "@/components/staff/StaffHeader";
import ContentManagementCard from "@/components/staff/ContentManagementCard";
import ShowManagementCard from "@/components/staff/ShowManagementCard";
import AdminCard from "@/components/staff/AdminCard";
import StatsPanel from "@/components/staff/StatsPanel";
import LoadingSpinner from "@/components/staff/LoadingSpinner";

const StaffPanel = () => {
  const { toast } = useToast();
  const [isManageStaffOpen, setIsManageStaffOpen] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const { staffName, isAdmin, isLoading, handleLogout, userRole } = useStaffAuth();

  const handleManageUsers = () => {
    setIsManageStaffOpen(true);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <StaffHeader 
            staffName={staffName} 
            isAdmin={isAdmin} 
            showLogoutButton={false}
            title="Unified Staff Dashboard"
          />
          
          <Button 
            variant="outline" 
            onClick={() => setIsProfileEditorOpen(true)}
            className="mt-4 sm:mt-0 flex items-center gap-2"
          >
            <UserCog className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ContentManagementCard userRole={userRole} />
          <ShowManagementCard />
          <AdminCard 
            onManageStaff={handleManageUsers} 
            onLogout={handleLogout} 
            userRole={userRole}
          />
        </div>

        <StatsPanel />
      </div>
      
      <ManageStaffModal 
        open={isManageStaffOpen}
        onOpenChange={setIsManageStaffOpen}
        currentUserRole={userRole}
      />
      
      <StaffProfileEditor
        open={isProfileEditorOpen}
        onOpenChange={setIsProfileEditorOpen}
      />
    </>
  );
};

export default StaffPanel;
