
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ManageStaffModal from "@/components/ManageStaffModal";

// Import new components
import StaffHeader from "@/components/staff/StaffHeader";
import ContentManagementCard from "@/components/staff/ContentManagementCard";
import ShowManagementCard from "@/components/staff/ShowManagementCard";
import AdminCard from "@/components/staff/AdminCard";
import StatsPanel from "@/components/staff/StatsPanel";
import LoadingSpinner from "@/components/staff/LoadingSpinner";

const StaffPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [staffName, setStaffName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isManageStaffOpen, setIsManageStaffOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/staff-login");
          return;
        }
        
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (staffError || !staffData) {
          await supabase.auth.signOut();
          navigate("/staff-login");
          return;
        }
        
        setStaffName(staffData.first_name || staffData.email);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/staff-login");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/staff-login");
        }
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  const handleManageUsers = () => {
    setIsManageStaffOpen(true);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully.",
      });
      navigate("/staff-login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was an error during logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="space-y-8">
          <StaffHeader staffName={staffName} />

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
