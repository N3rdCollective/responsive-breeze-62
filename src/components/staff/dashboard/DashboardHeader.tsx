
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  staffName: string;
  staffRole: string;
  onRefresh: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  staffName,
  staffRole,
  onRefresh
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 px-2 sm:px-0">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
          Welcome back, {staffName}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Here's what's happening with your station today.
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="p-2"
          title="Refresh data"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Badge variant="secondary" className="text-xs px-2 py-1 w-full sm:w-auto justify-center sm:justify-start">
          {staffRole?.toUpperCase()}
        </Badge>
      </div>
    </div>
  );
};

export default DashboardHeader;
