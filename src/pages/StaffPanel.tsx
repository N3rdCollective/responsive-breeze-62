
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const StaffPanel = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Staff Control Panel</h1>
            <p className="text-gray-500">
              Welcome to the staff control panel. Manage your radio station content here.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Content Management</h3>
              <p className="text-gray-500">Manage news articles, show schedules, and playlists.</p>
              <Button className="w-full">Access Content</Button>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">User Management</h3>
              <p className="text-gray-500">Manage staff accounts and permissions.</p>
              <Button className="w-full">Manage Users</Button>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Analytics</h3>
              <p className="text-gray-500">View listener statistics and engagement metrics.</p>
              <Button className="w-full">View Analytics</Button>
            </Card>
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
