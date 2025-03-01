
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import ManageStaffModal from "@/components/ManageStaffModal";
import { useStaffAuth } from "@/hooks/useStaffAuth";

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
  const { staffName, isAdmin, isLoading, handleLogout } = useStaffAuth();

  const handleManageUsers = () => {
    setIsManageStaffOpen(true);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="space-y-8">
          <StaffHeader staffName={staffName} isAdmin={isAdmin} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ContentManagementCard />
            <ShowManagementCard />
            <AdminCard 
              onManageStaff={handleManageUsers} 
              onLogout={handleLogout} 
            />
          </div>

          <StatsPanel />
        </div>
      </div>
      
      <ManageStaffModal 
        open={isManageStaffOpen}
        onOpenChange={setIsManageStaffOpen}
      />
      
      <Footer />
    </div>
  );
};

export default StaffPanel;
