
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
  const { isLoading, isAuthenticated, userRole, handleLogout } = useStaffAuth();

  console.log('🛡️ StaffRouteProtection check:', {
    isLoading,
    isAuthenticated,
    userRole,
    requiredRoles
  });

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('⏳ Still loading, showing spinner...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Verifying staff access...</p>
          <p className="text-sm text-muted-foreground mt-2">This may take a moment...</p>
        </div>
      </div>
    );
  }

  // Only redirect after loading is complete and we're certain user is not authenticated
  if (!isLoading && !isAuthenticated) {
    console.log('❌ Not authenticated after loading complete, redirecting to login');
    return <Navigate to="/staff/login" replace />;
  }

  // Check role-based permissions if required roles are specified and user is authenticated
  if (isAuthenticated && requiredRoles.length > 0 && userRole && !requiredRoles.includes(userRole)) {
    console.log('❌ Role check failed:', { userRole, requiredRoles });
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
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Only render protected content if authenticated (or still loading)
  if (isAuthenticated || isLoading) {
    console.log('✅ Access granted, rendering protected content');
    return <>{children}</>;
  }

  // Fallback loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default StaffRouteProtection;
