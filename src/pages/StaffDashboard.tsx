import React from "react";
import { useNavigate } from "react-router-dom";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Radio, 
  Users, 
  BarChart3,
  ArrowRight
} from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { staffName, isLoading } = useStaffAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TitleUpdater title="Staff Dashboard" />
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Staff Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome back, {staffName || "Staff Member"}! Streamline your workflow below.
        </p>
      </div>

      {/* Notice Card for Unified Dashboard */}
      <Card className="mb-8 border-primary/50 bg-primary/5 dark:bg-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <BarChart3 className="h-5 w-5" />
            Enhanced Unified Dashboard Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/80 mb-4">
            Explore our new Unified Staff Dashboard for improved functionality, 
            better user management, and integrated moderation tools.
          </p>
          <Button 
            onClick={() => navigate('/staff/panel')} // UPDATED: Navigate to /staff/panel
            // className="bg-primary hover:bg-primary/90" // uses default variant
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Go to Unified Dashboard
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </CardContent>
      </Card>

      {/* Quick Access Cards Section Title */}
      <h2 className="text-2xl font-semibold mb-4 mt-10">Quick Access Tools</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card 
          className="hover:shadow-lg transition-shadow duration-200 ease-in-out cursor-pointer group" 
          onClick={() => navigate('/staff/news')} // Corrected navigation to /staff/news list page
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary group-hover:text-primary-dark" />
                News Management
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create, edit, and manage news articles and blog posts.
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow duration-200 ease-in-out cursor-pointer group" 
          onClick={() => navigate('/staff/shows-manager')}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-primary group-hover:text-primary-dark" />
                Show Schedule
              </span>
               <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage radio shows, schedules, and programming.
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow duration-200 ease-in-out cursor-pointer group" 
          onClick={() => navigate('/staff/user-manager')}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary group-hover:text-primary-dark" />
                User Management
              </span>
               <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Oversee community members and manage accounts.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default StaffDashboard;
