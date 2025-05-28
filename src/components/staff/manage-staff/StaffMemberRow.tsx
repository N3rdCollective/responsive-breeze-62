
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import StaffMemberRoleSelect from "./row-actions/StaffMemberRoleSelect";
import StaffMemberPasswordResetButton from "./row-actions/StaffMemberPasswordResetButton";
import StaffMemberRemoveButton from "./row-actions/StaffMemberRemoveButton";
import { StaffMember } from "./types/pendingStaffTypes";
import { useStaffMemberPermissions } from "./hooks/useStaffMemberPermissions";

interface StaffMemberRowProps {
  staff: StaffMember;
  currentUserRole: string;
  onUpdate: () => void;
  isUpdatingRole: boolean;
  setIsUpdatingRole: (isUpdating: boolean) => void;
  isSendingReset: boolean;
  setIsSendingReset: (isSending: boolean) => void;
  isRemoving: boolean;
  setIsRemoving: (isRemoving: boolean) => void;
}

const StaffMemberRow: React.FC<StaffMemberRowProps> = ({
  staff,
  currentUserRole,
  onUpdate,
  isUpdatingRole,
  setIsUpdatingRole,
  isSendingReset,
  setIsSendingReset,
  isRemoving,
  setIsRemoving
}) => {
  const {
    canModifyRole,
    canSendPasswordReset,
    canRemove,
    isTargetSuperAdmin
  } = useStaffMemberPermissions(currentUserRole, staff.role);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getDisplayName = () => {
    if (staff.display_name) return staff.display_name;
    if (staff.first_name && staff.last_name) {
      return `${staff.first_name} ${staff.last_name}`;
    }
    if (staff.first_name) return staff.first_name;
    if (staff.last_name) return staff.last_name;
    return staff.email;
  };

  const isAnyActionDisabled = isUpdatingRole || isSendingReset || isRemoving;

  return (
    <TableRow>
      <TableCell className="font-medium">
        {getDisplayName()}
      </TableCell>
      <TableCell>{staff.email}</TableCell>
      <TableCell>
        <StaffMemberRoleSelect
          staff={staff}
          currentUserRole={currentUserRole}
          canModify={canModifyRole}
          disabled={isAnyActionDisabled}
          onUpdate={onUpdate}
          setParentIsUpdatingRole={setIsUpdatingRole}
        />
      </TableCell>
      <TableCell>{formatDate(staff.created_at)}</TableCell>
      <TableCell className="text-right space-x-2">
        <StaffMemberPasswordResetButton
          staff={staff}
          currentUserRole={currentUserRole}
          canSendReset={canSendPasswordReset}
          isTargetSuperAdmin={isTargetSuperAdmin}
          disabled={isAnyActionDisabled}
          onUpdate={onUpdate}
          setParentIsSendingReset={setIsSendingReset}
        />
        <StaffMemberRemoveButton
          staff={staff}
          currentUserRole={currentUserRole}
          canRemove={canRemove}
          disabled={isAnyActionDisabled}
          onUpdate={onUpdate}
        />
      </TableCell>
    </TableRow>
  );
};

export default StaffMemberRow;
