
import React, { createContext, useContext, ReactNode } from 'react';
// Import the actual hooks and types from their correct locations in the /staff directory
import { useAuthState as useStaffAuthStateHook, StaffAuthState } from "./staff/useAuthState"; // Assuming StaffAuthState includes staffName, staffId, userRole, isLoading, permissions
import { useLogout as useStaffLogoutHook } from "./staff/useLogout";

// Define the context type using the imported StaffAuthState from ./staff/useAuthState
interface StaffAuthContextType extends StaffAuthState {
  handleLogout: () => Promise<void>;
}

// Define a default value for the context.
// This represents the state when no StaffAuthProvider is an ancestor,
// effectively meaning "no staff member is currently authenticated in this context."
const defaultStaffAuthContextValue: StaffAuthContextType = {
  // Default values for StaffAuthState fields
  staffName: null,
  staffId: null,
  userRole: null,
  isLoading: false,
  isAdmin: false, // Added missing property
  isAuthenticated: false, // Added missing property
  permissions: {}, 
  
  // Default handleLogout function for when the provider is not available
  handleLogout: async () => {
    console.warn(
      "Attempted to call staff logout, but StaffAuthProvider is not available in the current component tree. This usually means you are not on a staff-protected page or no staff is logged in."
    );
    // This function should ideally not be called if no staff is logged in.
    // A simple console warning is a safe default.
  },
};

// Create the context with the default value
const StaffAuthContext = createContext<StaffAuthContextType>(defaultStaffAuthContextValue);

// Provider component (remains largely the same)
export const StaffAuthProvider = ({ children }: { children: ReactNode }) => {
  // useStaffAuthStateHook will provide the actual state of the logged-in staff member,
  // or a state indicating no staff is logged in if that's the case.
  const authState = useStaffAuthStateHook({}); 
  const handleLogout = useStaffLogoutHook(authState.staffName);

  const value: StaffAuthContextType = {
    ...authState, // Spreads the actual staff auth state (e.g., name, role, permissions)
    handleLogout, // Provides the actual logout function
  };

  return (
    <StaffAuthContext.Provider value={value}>
      {children}
    </StaffAuthContext.Provider>
  );
};

// Hook to consume the context
// No undefined check is needed anymore because the context is initialized with a default value.
export const useStaffAuth = (): StaffAuthContextType => {
  return useContext(StaffAuthContext);
};

// Export the imported StaffAuthState type (from ./staff/useAuthState) for convenience
export type { StaffAuthState };

