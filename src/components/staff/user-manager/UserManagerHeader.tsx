
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, RefreshCw } from "lucide-react";

interface UserManagerHeaderProps {
  onBackToDashboard: () => void;
  onRefreshData: () => void;
}

const UserManagerHeader: React.FC<UserManagerHeaderProps> = ({
  onBackToDashboard,
  onRefreshData,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBackToDashboard} className="shrink-0">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="h-7 w-7 md:h-8 md:w-8 text-primary" />
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage community members and user accounts.
          </p>
        </div>
      </div>
      <Button onClick={onRefreshData} size="sm">
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh Data
      </Button>
    </div>
  );
};

export default UserManagerHeader;
