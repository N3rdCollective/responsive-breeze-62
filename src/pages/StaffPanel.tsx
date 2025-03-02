
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import ManageStaffModal from "@/components/ManageStaffModal";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { supabase } from "@/integrations/supabase/client";

// Import components
import StaffHeader from "@/components/staff/StaffHeader";
import ContentManagementCard from "@/components/staff/ContentManagementCard";
import ShowManagementCard from "@/components/staff/ShowManagementCard";
import AdminCard from "@/components/staff/AdminCard";
import StatsPanel from "@/components/staff/StatsPanel";
import LoadingSpinner from "@/components/staff/LoadingSpinner";

const StaffPanel = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isManageStaffOpen, setIsManageStaffOpen] = useState(false);
  const { staffName, isAdmin, isLoading, handleLogout, userRole } = useStaffAuth();

  // Add an effect to check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication status...");
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session:", session ? "Found" : "Not found");
      
      if (!session) {
        console.log("No session found, redirecting to login");
        navigate("/staff-login");
        toast({
          title: "Authentication Required",
          description: "Please log in to access the staff panel.",
        });
      } else {
        console.log("Session user ID:", session.user.id);
        console.log("Checking staff data for this user...");
        
        // Check if the user exists in the staff table
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (staffError) {
          console.error("Error fetching staff data:", staffError);
          toast({
            title: "Access Error",
            description: "There was an error verifying your staff access. Please try again.",
            variant: "destructive",
          });
        } else {
          console.log("Staff data found:", staffData);
        }
      }
    };
    
    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    console.log("Staff panel component state:", {
      staffName,
      isAdmin,
      userRole,
      isLoading
    });
  }, [staffName, isAdmin, userRole, isLoading]);

  const handleManageUsers = () => {
    console.log("Opening manage staff modal, current role:", userRole);
    setIsManageStaffOpen(true);
  };

  if (isLoading) {
    console.log("Staff panel is in loading state");
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
        currentUserRole={userRole}
      />
      
      <Footer />
    </div>
  );
};

export default StaffPanel;
