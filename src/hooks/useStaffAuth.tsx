
import React, { createContext, useContext, ReactNode } from 'react';
import { useStaffPermissions } from "./staff/useStaffPermissions";
import { useLogout as useStaffLogoutHook } from "./staff/useLogout";
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

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
  
  const [staffData, setStaffData] = useState<{
    staffName: string | null;
    staffId: string | null;
  }>({
    staffName: null,
    staffId: null,
  });
  
  const handleLogout = useStaffLogoutHook(staffData.staffName);

  // Fetch staff details when authentication is confirmed
  useEffect(() => {
    const fetchStaffDetails = async () => {
      if (!isStaff || loading) return;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: staffDetails, error } = await supabase
          .from('staff')
          .select('id, first_name, display_name, email')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching staff details:', error);
          return;
        }

        if (staffDetails) {
          setStaffData({
            staffName: staffDetails.display_name || staffDetails.first_name || staffDetails.email || 'Staff Member',
            staffId: staffDetails.id,
          });
        }
      } catch (error) {
        console.error('Error in fetchStaffDetails:', error);
      }
    };

    fetchStaffDetails();
  }, [isStaff, loading]);

  const value: StaffAuthContextType = {
    staffName: staffData.staffName,
    staffId: staffData.staffId,
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
