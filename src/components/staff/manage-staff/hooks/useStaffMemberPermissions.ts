
import { useMemo } from "react";

export const useStaffMemberPermissions = (currentUserRole: string, targetRole: string) => {
  return useMemo(() => {
    const isCurrentUserSuperAdmin = currentUserRole === "super_admin";
    const isCurrentUserAdmin = currentUserRole === "admin";
    const isTargetSuperAdmin = targetRole === "super_admin";
    const isTargetAdmin = targetRole === "admin";

    // Super admins can modify anyone except other super admins
    // Admins can modify everyone except super admins and other admins
    const canModifyRole = isCurrentUserSuperAdmin && !isTargetSuperAdmin;

    // Password reset permissions: similar to role modification
    const canSendPasswordReset = 
      (isCurrentUserSuperAdmin && !isTargetSuperAdmin) ||
      (isCurrentUserAdmin && !isTargetSuperAdmin && !isTargetAdmin);

    // Remove permissions: only super admins can remove staff
    const canRemove = isCurrentUserSuperAdmin && !isTargetSuperAdmin;

    return {
      canModifyRole,
      canSendPasswordReset,
      canRemove,
      isTargetSuperAdmin
    };
  }, [currentUserRole, targetRole]);
};
