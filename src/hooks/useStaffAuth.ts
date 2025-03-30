
import { useAuthState, StaffAuthState } from "./staff/useAuthState";
import { useLogout } from "./staff/useLogout";

interface UseStaffAuthProps {
  redirectUnauthorized?: boolean;
  redirectPath?: string;
}

export const useStaffAuth = (props: UseStaffAuthProps = {}) => {
  const authState = useAuthState(props);
  const handleLogout = useLogout(authState.staffName);

  return {
    ...authState,
    handleLogout
  };
};

// Export the type for use in other components
export type { StaffAuthState };
