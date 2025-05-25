import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TitleUpdater from '@/components/TitleUpdater';
import { useStaffAuth } from '@/hooks/useStaffAuth';

const StaffUserManager = () => {
  const navigate = useNavigate();
  const { userRole, isLoading: authLoading } = useStaffAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-128px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="mb-6">You do not have permission to manage users.</p>
          <Button onClick={() => navigate('/')}>Go to Homepage</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <TitleUpdater title="Manage Users - Staff Panel" />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <Button variant="outline" size="sm" onClick={() => navigate('/staff/panel')} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Staff Panel
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">User Management</h1>
            <p className="text-muted-foreground mb-8">
              This section is for managing user accounts, roles, and permissions. Currently under development.
            </p>
            <div className="p-8 border border-dashed rounded-lg">
              <p className="text-lg">Coming Soon!</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default StaffUserManager;
