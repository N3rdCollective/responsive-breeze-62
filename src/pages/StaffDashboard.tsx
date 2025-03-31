
import { useState } from "react";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import StaffHeader from "@/components/staff/StaffHeader";
import ContentManagementCard from "@/components/staff/ContentManagementCard";
import ShowManagementCard from "@/components/staff/ShowManagementCard";
import AdminCard from "@/components/staff/AdminCard";
import StatsPanel from "@/components/staff/StatsPanel";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import ManageStaffModal from "@/components/ManageStaffModal";
import StaffProfileEditor from "@/components/staff/StaffProfileEditor";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { UserCog } from "lucide-react";

const StaffDashboard = () => {
  const { userRole, isLoading, staffName, isAdmin, handleLogout } = useStaffAuth();
  const [isManageStaffOpen, setIsManageStaffOpen] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  
  const handleManageUsers = () => {
    setIsManageStaffOpen(true);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between mb-4">
          <StaffHeader 
            staffName={staffName}
            isAdmin={isAdmin}
            showLogoutButton={true}
            onLogout={handleLogout}
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <ContentManagementCard userRole={userRole} />
          
          <div className="space-y-6">
            <ShowManagementCard />
            
            {isAdmin && (
              <AdminCard 
                onManageStaff={handleManageUsers} 
                onLogout={handleLogout}
              />
            )}
          </div>
        </div>
        
        <div className="mt-8">
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
      </div>
      <Footer />
    </div>
  );
};

export default StaffDashboard;
