
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const StaffPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Staff Control Panel</h1>
            <p className="text-gray-500">
              Welcome to the staff control panel. Manage your radio station content here.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Content Management</h3>
              <p className="text-gray-500">Edit website pages and manage content.</p>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleEditPage("Home")}
                >
                  Edit Home Page
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleEditPage("About")}
                >
                  Edit About Page
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleEditPage("News")}
                >
                  Edit News
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleEditPage("Personalities")}
                >
                  Edit Personalities
                </Button>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Show Management</h3>
              <p className="text-gray-500">Manage radio shows and schedules.</p>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
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
                  className="w-full"
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
                  className="w-full"
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

            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Administration</h3>
              <p className="text-gray-500">Manage staff and view analytics.</p>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleManageUsers}
                >
                  Manage Staff
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleViewAnalytics}
                >
                  View Analytics
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    toast({
                      title: "Logged Out",
                      description: "You have been logged out successfully.",
                    });
                    navigate("/staff-login");
                  }}
                >
                  Logout
                </Button>
              </div>
            </Card>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mt-8">
            <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">1.2M</div>
                <div className="text-sm text-gray-500">Monthly Listeners</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">45</div>
                <div className="text-sm text-gray-500">Active Shows</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">12</div>
                <div className="text-sm text-gray-500">Staff Members</div>
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">89%</div>
                <div className="text-sm text-gray-500">Engagement Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-20">
        <Footer />
      </div>
    </div>
  );
};

export default StaffPanel;
