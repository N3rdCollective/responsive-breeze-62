
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

const SystemStatusCard: React.FC = () => {
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
          <span className="truncate">System Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg min-h-[4rem]">
            <span className="text-sm font-medium truncate">Server Status</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs flex-shrink-0 ml-2">
              Online
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg min-h-[4rem]">
            <span className="text-sm font-medium truncate">Database</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs flex-shrink-0 ml-2">
              Healthy
            </Badge>
          </div>
          <div className="flex items-center justify-between p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg min-h-[4rem] sm:col-span-2 lg:col-span-1">
            <span className="text-sm font-medium truncate">Stream Status</span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs flex-shrink-0 ml-2">
              Live
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatusCard;
