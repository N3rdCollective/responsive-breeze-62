
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ManageStaffModal from "@/components/ManageStaffModal";
import { useAuth } from "@/hooks/useAuth";
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
  const { user, isStaff, staffRole, isLoading, logout } = useAuth();

  const staffName = user?.user_metadata?.display_name || user?.user_metadata?.first_name || user?.email || 'Staff Member';
  const isAdmin = staffRole === 'admin' || staffRole === 'super_admin';

  const handleManageUsers = () => {
    setIsManageStaffOpen(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <div className="space-y-6 sm:space-y-8 max-w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <StaffHeader 
              staffName={staffName} 
              isAdmin={isAdmin} 
              showLogoutButton={false}
              title="Unified Staff Dashboard"
            />
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setIsProfileEditorOpen(true)}
            className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto"
          >
            <UserCog className="h-4 w-4" />
            <span className="sm:inline">Edit Profile</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-1">
            <ContentManagementCard userRole={staffRole} />
          </div>
          <div className="lg:col-span-1">
            <ShowManagementCard />
          </div>
          <div className="lg:col-span-2 xl:col-span-1">
            <AdminCard 
              onManageStaff={handleManageUsers} 
              onLogout={handleLogout} 
              userRole={staffRole}
            />
          </div>
        </div>

        <div className="w-full">
          <StatsPanel />
        </div>
      </div>
      
      <ManageStaffModal 
        open={isManageStaffOpen}
        onOpenChange={setIsManageStaffOpen}
        currentUserRole={staffRole || 'staff'}
      />
      
      <StaffProfileEditor
        open={isProfileEditorOpen}
        onOpenChange={setIsProfileEditorOpen}
      />
    </>
  );
};

export default StaffPanel;
