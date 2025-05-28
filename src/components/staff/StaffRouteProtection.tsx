
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStaffAuth } from '@/hooks/useStaffAuth';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle } from 'lucide-react';

interface StaffRouteProtectionProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const StaffRouteProtection: React.FC<StaffRouteProtectionProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { isLoading, isAuthenticated, userRole, staffName } = useStaffAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Verifying staff access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !staffName) {
    return <Navigate to="/staff/login" replace />;
  }

  // Check role-based permissions if required roles are specified
  if (requiredRoles.length > 0 && userRole && !requiredRoles.includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have the required permissions to access this area.
          </p>
          <div className="space-y-2 mb-6">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Your role:</span> {userRole}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Required:</span> {requiredRoles.join(', ')}
            </p>
          </div>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Render protected content if all checks pass
  return <>{children}</>;
};

export default StaffRouteProtection;
