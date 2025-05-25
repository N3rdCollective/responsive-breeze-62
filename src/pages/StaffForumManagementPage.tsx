
import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, 
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";

const StaffForumManager = () => {
  const navigate = useNavigate();
  // staffName and userRole are defined but not used in this version.
  // This is fine, they might be used if functionality is expanded later.
  const { staffName, userRole, isLoading } = useStaffAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-128px)]"> {/* Adjusted height for consistency */}
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div> {/* Standardized loader */}
            <p className="text-lg text-muted-foreground">Loading Forum Management...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <TitleUpdater /> {/* Title will be set by system settings or default */}
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 pt-24 pb-16"> {/* Changed to main, consistent padding */}
          {/* Header */}
          <div className="flex items-start sm:items-center justify-between mb-8 flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => navigate('/staff/panel')}> {/* Changed back to /staff/panel based on Unified Dashboard structure */}
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Staff Panel
                </Button>
            </div>
            <div className="text-center sm:text-left"> {/* Centered on mobile, left on sm+ */}
              <h1 className="text-3xl font-bold flex items-center gap-2 justify-center sm:justify-start">
                <MessageSquare className="h-8 w-8 text-primary" />
                Forum Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage forum categories, topics, and moderation via Unified Dashboard.
              </p>
            </div>
          </div>


          {/* Notice Card */}
          <Card className="border-primary/50 bg-primary/5 dark:bg-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <MessageSquare className="h-5 w-5" />
                Enhanced Forum Moderation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80 mb-4">
                All forum management and moderation features are now integrated into the 
                Unified Staff Dashboard. This includes tools for content review, user reports, 
                and maintaining community guidelines.
              </p>
              <Button 
                onClick={() => navigate('/staff/moderation')} // Points to the moderation section, likely within unified or specific page
                // className="bg-primary hover:bg-primary/90" // Uses default variant
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Go to Moderation Tools
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default StaffForumManager;
