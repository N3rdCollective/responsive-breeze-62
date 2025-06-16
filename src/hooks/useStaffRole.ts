
import { useAuth } from "@/hooks/useAuth";

export const useStaffRole = () => {
  const { staffRole, isStaff, isLoading, user } = useAuth();
  
  return {
    userRole: staffRole,
    isAuthenticated: isStaff,
    isLoading,
    staffName: user?.user_metadata?.display_name || user?.user_metadata?.first_name || user?.email || 'Staff Member',
    isAdmin: staffRole === 'admin' || staffRole === 'super_admin',
    staffId: user?.id || null,
  };
};
