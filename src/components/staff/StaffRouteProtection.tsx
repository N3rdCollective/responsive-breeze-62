
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface StaffRouteProtectionProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const StaffRouteProtection: React.FC<StaffRouteProtectionProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { isLoading, isStaff, staffRole, logout } = useAuth();
  const location = useLocation();

  console.log('🛡️ StaffRouteProtection check:', {
    isLoading,
    isStaff,
    staffRole,
    requiredRoles,
    currentPath: location.pathname
  });

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('⏳ Still loading, showing spinner...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Verifying staff access...</p>
          <p className="text-sm text-muted-foreground mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  // Only redirect if we're certain the user is not staff AND not on login/signup pages
  const isAuthPage = location.pathname.includes('/staff/login') || location.pathname.includes('/staff/signup');
  
  if (!isLoading && !isStaff && !isAuthPage) {
    console.log('❌ Not staff member, redirecting to login');
    return <Navigate to="/staff/login" replace />;
  }

  // If user is authenticated but on login page, redirect to panel
  if (!isLoading && isStaff && isAuthPage) {
    console.log('✅ Already authenticated, redirecting to panel');
    return <Navigate to="/staff/panel" replace />;
  }

  // Check role-based permissions if required roles are specified and user is staff
  if (isStaff && requiredRoles.length > 0 && staffRole && !requiredRoles.includes(staffRole)) {
    console.log('❌ Role check failed:', { staffRole, requiredRoles });
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
              <span className="font-medium">Your role:</span> {staffRole}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Required:</span> {requiredRoles.join(', ')}
            </p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.history.back()} variant="outline">
              Go Back
            </Button>
            <Button onClick={logout} variant="destructive">
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render protected content if authenticated or on auth pages
  console.log('✅ Access granted, rendering content');
  return <>{children}</>;
};

export default StaffRouteProtection;
