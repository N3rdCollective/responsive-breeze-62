
import React, { createContext, useContext, ReactNode } from 'react';
import { useStaffPermissions } from "./staff/useStaffPermissions";
import { useLogout as useStaffLogoutHook } from "./staff/useLogout";

// Define the context type using the staff permissions system
interface StaffAuthContextType {
  staffName: string | null;
  staffId: string | null;
  userRole: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  validateAction: (actionType: string, resourceType?: string, targetId?: string) => Promise<boolean>;
  handleLogout: () => Promise<void>;
}

// Define a default value for the context
const defaultStaffAuthContextValue: StaffAuthContextType = {
  staffName: null,
  staffId: null,
  userRole: null,
  isLoading: false,
  isAdmin: false,
  isAuthenticated: false,
  permissions: [],
  hasPermission: () => false,
  validateAction: async () => false,
  handleLogout: async () => {
    console.warn("Attempted to call staff logout, but StaffAuthProvider is not available.");
  },
};

// Create the context with the default value
const StaffAuthContext = createContext<StaffAuthContextType>(defaultStaffAuthContextValue);

// Provider component using the new secure permission system
export const StaffAuthProvider = ({ children }: { children: ReactNode }) => {
  const { 
    isStaff, 
    role, 
    permissions, 
    loading, 
    hasPermission, 
    validateAction 
  } = useStaffPermissions();
  
  const handleLogout = useStaffLogoutHook(null); // We'll get the staff name from permissions if needed

  const value: StaffAuthContextType = {
    staffName: null, // This could be derived from user profile if needed
    staffId: null, // This could be derived from auth if needed
    userRole: role,
    isLoading: loading,
    isAdmin: role === 'admin' || role === 'super_admin',
    isAuthenticated: isStaff,
    permissions,
    hasPermission,
    validateAction,
    handleLogout,
  };

  return (
    <StaffAuthContext.Provider value={value}>
      {children}
    </StaffAuthContext.Provider>
  );
};

// Hook to consume the context
export const useStaffAuth = (): StaffAuthContextType => {
  return useContext(StaffAuthContext);
};

// Export types for convenience
export type { StaffAuthContextType as StaffAuthState };
