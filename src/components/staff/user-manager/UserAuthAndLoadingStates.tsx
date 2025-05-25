
import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

interface UserAuthAndLoadingStatesProps {
  authLoading: boolean;
  dataLoading: boolean;
  isAuthorized: boolean;
  onGoToHomepage: () => void;
}

const UserAuthAndLoadingStates: React.FC<UserAuthAndLoadingStatesProps> = ({
  authLoading,
  dataLoading,
  isAuthorized,
  onGoToHomepage,
}) => {
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

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="mb-6">You do not have permission to manage users.</p>
          <Button onClick={onGoToHomepage}>Go to Homepage</Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-128px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return null; // If none of the above, render nothing (main content will be shown)
};

export default UserAuthAndLoadingStates;
