
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StaffHeader from "@/components/staff/StaffHeader";
import PersonalityEditor from "@/components/staff/personalities/PersonalityEditor";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Navigate } from "react-router-dom";

const StaffPersonalities = () => {
  const { isAuthenticated, isLoading } = useStaffAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/staff/login" />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="pt-16 pb-24">
        <StaffHeader title="Personality Management" subtitle="Edit radio personalities and their details" />
        <PersonalityEditor />
      </div>
      <Footer />
    </div>
  );
};

export default StaffPersonalities;
