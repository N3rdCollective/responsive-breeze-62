
import { StaffMember } from "../types/pendingStaffTypes";

export const useStaffMemberPermissions = (staff: StaffMember | undefined, currentUserRole: string | undefined) => {
  if (!staff || !currentUserRole) {
    return {
      isTargetSuperAdmin: false,
      canModifyDetails: false,
      canSendPasswordReset: false,
    };
  }

  const isTargetSuperAdmin = staff.role === "super_admin";

  // Can current user modify this staff member's role or remove them?
  const canModifyDetails =
    (currentUserRole === "admin" || currentUserRole === "super_admin") &&
    !isTargetSuperAdmin &&
    (staff.role !== "admin" || currentUserRole === "super_admin");

  // Can current user send a password reset for this staff member?
  const canSendPasswordReset =
    (currentUserRole === "admin" || currentUserRole === "super_admin") &&
    !isTargetSuperAdmin && // Cannot reset super_admin's password
    (staff.role !== "admin" || currentUserRole === "super_admin"); // Admin cannot reset other admin, only super_admin can

  return {
    isTargetSuperAdmin,
    canModifyDetails,
    canSendPasswordReset,
  };
};
