
import React, { createContext, useContext, ReactNode } from 'react';
// Import the actual hooks and types from their correct locations in the /staff directory
import { useAuthState as useActualStaffAuthState, StaffAuthState as ActualStaffAuthState } from "./staff/useAuthState";
import { useLogout as useActualStaffLogout } from "./staff/useLogout";

// Define the context type using the imported StaffAuthState from ./staff/useAuthState
interface StaffAuthContextType extends ActualStaffAuthState {
  handleLogout: () => Promise<void>;
}

// Create the context
const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

// Provider component
export const StaffAuthProvider = ({ children }: { children: ReactNode }) => {
  // Use the actual imported hooks
  const authState = useActualStaffAuthState({}); // Fetches staff auth state
  // useActualStaffLogout now returns a function named 'logout', which is assigned to 'handleLogout' here.
  // The context still exposes this function as 'handleLogout'.
  const handleLogout = useActualStaffLogout(authState.staffName); 

  const value: StaffAuthContextType = {
    ...authState,
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
  const context = useContext(StaffAuthContext);
  if (context === undefined) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
};

// Export the imported StaffAuthState type (from ./staff/useAuthState) for convenience
// This allows other parts of the application to use `StaffAuthState` via `useStaffAuth`
export type { ActualStaffAuthState as StaffAuthState };
