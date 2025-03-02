
import { useStaffAuth } from "@/hooks/useStaffAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PersonalityEditor from "@/components/staff/personalities/PersonalityEditor";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import AccessDenied from "@/components/staff/news/AccessDenied";

const StaffPersonalityEdit = () => {
  const { userRole, isLoading: authLoading } = useStaffAuth();
  const isAdmin = userRole === "admin";
  const isModerator = userRole === "moderator";
  const isSuperAdmin = userRole === "super_admin";
  
  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin && !isModerator && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <AccessDenied />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Edit Personality</h1>
          <p className="text-muted-foreground mt-2">
            Update the information for this personality.
          </p>
        </div>
        
        <PersonalityEditor />
      </main>
      <Footer />
    </div>
  );
};

export default StaffPersonalityEdit;
