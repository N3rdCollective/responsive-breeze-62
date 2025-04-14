
import { useAuthState, StaffAuthState } from "./staff/useAuthState";
import { useLogout } from "./staff/useLogout";

interface UseStaffAuthProps {
  redirectUnauthorized?: boolean;
  redirectPath?: string;
}

export const useStaffAuth = (props: UseStaffAuthProps = {}) => {
  const authState = useAuthState(props);
  const handleLogout = useLogout(authState.staffName);

  // Determine admin status based on staff role
  const isAdmin = authState.staffRole === "admin" || authState.staffRole === "super_admin";
  
  return {
    ...authState,
    handleLogout,
    user: authState.user,
    isLoggedIn: !!authState.user,
    userRole: authState.staffRole, // Add userRole property that points to staffRole
    isAdmin, // Add isAdmin property based on role
  };
};

// Export the type for use in other components
export type { StaffAuthState };
