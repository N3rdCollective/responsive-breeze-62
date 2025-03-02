
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import PersonalitiesManager from "@/components/staff/personalities/PersonalitiesManager";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const StaffPersonalities = () => {
  const { isLoading, userRole } = useStaffAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            className="mr-4"
            onClick={() => navigate("/staff-panel")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Manage Personalities</h1>
        </div>

        <PersonalitiesManager currentUserRole={userRole} />
      </div>
      <Footer />
    </div>
  );
};

export default StaffPersonalities;
