
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  BarChart3, 
  TrendingUp,
  CheckCircle
} from 'lucide-react';

interface QuickActionsCardProps {
  isAdmin: boolean;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ isAdmin }) => {
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
          <span className="truncate">Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 gap-3">
          <Button variant="outline" className="justify-start h-auto p-3 sm:p-4 w-full" asChild>
            <a href="/staff/news" className="flex items-start gap-3 text-left">
              <FileText className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm sm:text-base truncate">Manage News</div>
                <div className="text-xs text-muted-foreground">Create & edit posts</div>
              </div>
            </a>
          </Button>
          
          <Button variant="outline" className="justify-start h-auto p-3 sm:p-4 w-full" asChild>
            <a href="/staff/users" className="flex items-start gap-3 text-left">
              <Users className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm sm:text-base truncate">User Management</div>
                <div className="text-xs text-muted-foreground">Manage members</div>
              </div>
            </a>
          </Button>
          
          <Button variant="outline" className="justify-start h-auto p-3 sm:p-4 w-full" asChild>
            <a href="/staff/analytics" className="flex items-start gap-3 text-left">
              <BarChart3 className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm sm:text-base truncate">Analytics</div>
                <div className="text-xs text-muted-foreground">View insights</div>
              </div>
            </a>
          </Button>
          
          {isAdmin && (
            <Button variant="outline" className="justify-start h-auto p-3 sm:p-4 w-full" asChild>
              <a href="/staff/homepage" className="flex items-start gap-3 text-left">
                <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm sm:text-base truncate">Site Settings</div>
                  <div className="text-xs text-muted-foreground">Configure system</div>
                </div>
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
