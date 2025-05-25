
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthState as useStaffAuthStateHook, StaffAuthState } from "./staff/useAuthState";
import { useLogout as useStaffLogoutHook } from "./staff/useLogout";

interface StaffAuthContextType extends StaffAuthState {
  handleLogout: () => Promise<void>;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

const StaffAuthProvider = ({ children }: { children: ReactNode }) => {
  const authState = useStaffAuthStateHook({}); 
  const handleLogout = useStaffLogoutHook(authState.staffName);

  const value: StaffAuthContextType = { // Added explicit type for value
    ...authState,
    handleLogout,
  };

  return (
    <StaffAuthContext.Provider value={value}>
      {children}
    </StaffAuthContext.Provider>
  );
};

export const useStaffAuth = (): StaffAuthContextType => {
  const context = useContext(StaffAuthContext);
  if (context === undefined) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
};

export type { StaffAuthState };
export default StaffAuthProvider;

