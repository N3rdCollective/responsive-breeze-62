
import React from "react";
import { useNavigate } from "react-router-dom";
import { useStaffRole } from "@/hooks/useStaffRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";

const StaffUserEditor = () => {
  const navigate = useNavigate();
  const { staffName, userRole, isLoading } = useStaffRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-128px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading User Management...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TitleUpdater />
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="order-2 sm:order-1">
            <Button variant="outline" size="sm" onClick={() => navigate('/staff/panel')} className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Staff Panel
            </Button>
          </div>
          <div className="text-center sm:text-right order-1 sm:order-2 w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 justify-center sm:justify-end">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="break-words">User Management</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Manage users, permissions, and accounts via Unified Dashboard.
            </p>
          </div>
        </div>

        {/* Notice Card */}
        <Card className="border-primary/50 bg-primary/5 dark:bg-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-primary text-lg sm:text-xl">
              <Users className="h-5 w-5 flex-shrink-0" />
              <span className="break-words">Enhanced User Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground/80 text-sm sm:text-base leading-relaxed">
              All user management features are now integrated into the 
              Unified Staff Dashboard. This includes user accounts, permissions, 
              and administrative tools.
            </p>
            <Button 
              onClick={() => navigate('/staff/panel?tab=users')}
              className="w-full sm:w-auto"
            >
              <Users className="h-4 w-4 mr-2" />
              Go to User Management
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default StaffUserEditor;
