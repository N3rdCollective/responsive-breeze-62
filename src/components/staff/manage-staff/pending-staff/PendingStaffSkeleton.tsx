
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const PendingStaffSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pending Staff</h3>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingStaffSkeleton;
