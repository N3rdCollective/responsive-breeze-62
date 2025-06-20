
import React from "react";
import { useStaffRole } from "@/hooks/useStaffRole";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import AccessDenied from "@/components/staff/news/AccessDenied";
import TitleUpdater from "@/components/TitleUpdater";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const StaffUsersPage = () => {
  const { userRole, isLoading, staffName } = useStaffRole();
  
  // Check if user has appropriate permissions
  const canManageUsers = userRole === "admin" || userRole === "moderator" || userRole === "super_admin";
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!canManageUsers) {
    return <AccessDenied />;
  }
  
  return (
    <>
      <TitleUpdater title="User Management" />
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts, permissions, and settings
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              User management functionality will be implemented here.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default StaffUsersPage;
