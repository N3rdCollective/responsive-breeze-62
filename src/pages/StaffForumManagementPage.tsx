
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StaffHeader from "@/components/staff/StaffHeader";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const StaffForumManagementPage = () => {
  const { staffName, isAdmin, isLoading, handleLogout } = useStaffAuth({ redirectUnauthorized: true });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-128px)]"> {/* Adjust height for navbar/footer */}
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <StaffHeader
          title="Forum Management"
          staffName={staffName}
          isAdmin={isAdmin}
          showLogoutButton={true}
          onLogout={handleLogout}
        />
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center gap-4">
            <MessageSquare className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Manage Forum</CardTitle>
              <CardDescription>Oversee forum categories, topics, and posts.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Forum management features are under development. Soon you'll be able to:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-1 text-muted-foreground">
              <li>Create, edit, and delete forum categories.</li>
              <li>Moderate topics: lock, sticky, move, or delete topics.</li>
              <li>Moderate posts: edit or delete user posts.</li>
              <li>View forum statistics and user activity.</li>
            </ul>
            <p className="mt-6 font-semibold">
              This section will provide tools for admins and moderators to ensure the forum remains a constructive and engaging space for the community.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default StaffForumManagementPage;
