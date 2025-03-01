
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const StaffPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [staffName, setStaffName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // No session found, redirect to login
          navigate("/staff-login");
          return;
        }
        
        // Check if the user is staff
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*")
          .eq("id", session.user.id)
          .single();
          
        if (staffError || !staffData) {
          // Not a staff member, sign out and redirect
          await supabase.auth.signOut();
          navigate("/staff-login");
          return;
        }
        
        // Set staff name for greeting
        setStaffName(staffData.first_name || staffData.email);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/staff-login");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Set up auth state listener
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

  const handleEditPage = (page: string) => {
    toast({
      title: `Edit ${page}`,
      description: `In a full implementation, this would open the editor for the ${page} page.`,
    });
  };

  const handleManageUsers = () => {
    toast({
      title: "Manage Users",
      description: "This would open the user management interface in a full implementation.",
    });
  };

  const handleViewAnalytics = () => {
    toast({
      title: "Analytics Dashboard",
      description: "This would display detailed analytics in a full implementation.",
    });
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter text-black dark:text-[#FFD700] sm:text-4xl">
              Staff Control Panel
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Welcome{staffName ? `, ${staffName}` : ""}! Manage your radio station content here.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6 space-y-4">
              <h3 className="text-xl font-semibold text-black dark:text-[#FFD700]">Content Management</h3>
              <p className="text-gray-500 dark:text-gray-400">Edit website pages and manage content.</p>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
                  onClick={() => handleEditPage("Home")}
                >
                  Edit Home Page
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
                  onClick={() => handleEditPage("About")}
                >
                  Edit About Page
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
                  onClick={() => handleEditPage("News")}
                >
                  Edit News
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
                  onClick={() => handleEditPage("Personalities")}
                >
                  Edit Personalities
                </Button>
              </div>
            </Card>

            <Card className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6 space-y-4">
              <h3 className="text-xl font-semibold text-black dark:text-[#FFD700]">Show Management</h3>
              <p className="text-gray-500 dark:text-gray-400">Manage radio shows and schedules.</p>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
                  onClick={() => {
                    toast({
                      title: "Schedule Management",
                      description: "This would open the show schedule editor.",
                    });
                  }}
                >
                  Manage Schedule
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
                  onClick={() => {
                    toast({
                      title: "Playlist Management",
                      description: "This would open the playlist editor.",
                    });
                  }}
                >
                  Manage Playlists
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
                  onClick={() => {
                    toast({
                      title: "Live Show Setup",
                      description: "This would open the live show configuration.",
                    });
                  }}
                >
                  Live Show Setup
                </Button>
              </div>
            </Card>

            <Card className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6 space-y-4">
              <h3 className="text-xl font-semibold text-black dark:text-[#FFD700]">Administration</h3>
              <p className="text-gray-500 dark:text-gray-400">Manage staff and view analytics.</p>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
                  onClick={handleManageUsers}
                >
                  Manage Staff
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full bg-white dark:bg-[#222222] text-black dark:text-white hover:bg-gray-100 dark:hover:bg-[#444444]"
                  onClick={handleViewAnalytics}
                >
                  View Analytics
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full bg-white dark:bg-[#222222] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </Card>
          </div>

          <div className="bg-[#F5F5F5] dark:bg-[#333333] border-[#666666]/20 dark:border-white/10 p-6 rounded-lg mt-8">
            <h3 className="text-xl font-semibold text-black dark:text-[#FFD700] mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#222222] p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-black dark:text-[#FFD700]">1.2M</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Monthly Listeners</div>
              </div>
              <div className="bg-white dark:bg-[#222222] p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-black dark:text-[#FFD700]">45</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Active Shows</div>
              </div>
              <div className="bg-white dark:bg-[#222222] p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-black dark:text-[#FFD700]">12</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Staff Members</div>
              </div>
              <div className="bg-white dark:bg-[#222222] p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-black dark:text-[#FFD700]">89%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Engagement Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StaffPanel;
