
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
    loading: permissionsLoading, 
    hasPermission, 
    validateAction 
  } = useStaffPermissions();
  
  const [staffData, setStaffData] = useState<{
    staffName: string | null;
    staffId: string | null;
    dataLoading: boolean;
  }>({
    staffName: null,
    staffId: null,
    dataLoading: true,
  });
  
  const handleLogout = useStaffLogoutHook(staffData.staffName);

  // Fetch staff details when authentication is confirmed
  useEffect(() => {
    const fetchStaffDetails = async () => {
      console.log('🔍 Fetching staff details...', { isStaff, permissionsLoading });
      
      if (permissionsLoading) {
        console.log('⏳ Still loading permissions, waiting...');
        return;
      }
      
      if (!isStaff) {
        console.log('❌ Not a staff member, clearing data');
        setStaffData({
          staffName: null,
          staffId: null,
          dataLoading: false,
        });
        return;
      }
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('❌ No authenticated user');
          setStaffData({
            staffName: null,
            staffId: null,
            dataLoading: false,
          });
          return;
        }

        console.log('✅ Fetching staff details for user:', user.id);

        const { data: staffDetails, error } = await supabase
          .from('staff')
          .select('id, first_name, display_name, email')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('❌ Error fetching staff details:', error);
          setStaffData({
            staffName: null,
            staffId: null,
            dataLoading: false,
          });
          return;
        }

        if (staffDetails) {
          const staffName = staffDetails.display_name || staffDetails.first_name || staffDetails.email || 'Staff Member';
          console.log('✅ Staff details loaded:', { staffName, role });
          setStaffData({
            staffName,
            staffId: staffDetails.id,
            dataLoading: false,
          });
        }
      } catch (error) {
        console.error('❌ Error in fetchStaffDetails:', error);
        setStaffData({
          staffName: null,
          staffId: null,
          dataLoading: false,
        });
      }
    };

    fetchStaffDetails();
  }, [isStaff, permissionsLoading]);

  // Calculate overall loading state - we're loading if either permissions or staff data is loading
  const isLoading = permissionsLoading || (isStaff && staffData.dataLoading);
  
  // Only consider authenticated if we have confirmed staff status and permissions are loaded
  const isAuthenticated = !permissionsLoading && isStaff;

  console.log('🔄 StaffAuth state:', {
    isStaff,
    role,
    permissionsLoading,
    dataLoading: staffData.dataLoading,
    isLoading,
    isAuthenticated,
    permissions: permissions.length
  });

  const value: StaffAuthContextType = {
    staffName: staffData.staffName,
    staffId: staffData.staffId,
    userRole: role,
    isLoading,
    isAdmin: role === 'admin' || role === 'super_admin',
    isAuthenticated,
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
