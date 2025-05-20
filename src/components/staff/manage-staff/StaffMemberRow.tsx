import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  StaffMember, 
  StaffRole, 
  ROLE_DISPLAY_NAMES,
} from "./types/pendingStaffTypes";
import { useStaffMemberPermissions } from "./hooks/useStaffMemberPermissions";
import StaffMemberRoleSelect from "./row-actions/StaffMemberRoleSelect";
import StaffMemberPasswordResetButton from "./row-actions/StaffMemberPasswordResetButton";
import StaffMemberRemoveButton from "./row-actions/StaffMemberRemoveButton";

interface StaffMemberRowProps {
  staff: StaffMember;
  onUpdate: () => void;
  currentUserRole: string;
}

const StaffMemberRow = ({ staff, onUpdate, currentUserRole }: StaffMemberRowProps) => {
  const [isUpdatingRole, setIsUpdatingRole] = useState<boolean>(false);
  const [isSendingReset, setIsSendingReset] = useState<boolean>(false);
  
  const { 
    isTargetSuperAdmin, 
    canModifyDetails, 
    canSendPasswordReset 
  } = useStaffMemberPermissions(staff, currentUserRole);

  const isProcessing = isUpdatingRole || isSendingReset;

  // getDisplayName and getRoleColor remain the same as they are specific to row display
  const getDisplayName = () => {
    if (staff.display_name) {
      return staff.display_name;
    }
    return (staff.first_name || staff.last_name 
      ? `${staff.first_name || ''} ${staff.last_name || ''}`.trim() 
      : '-');
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'super_admin':
        return 'text-purple-600 dark:text-purple-400';
      case 'admin':
        return 'text-blue-600 dark:text-blue-400';
      case 'moderator':
        return 'text-green-600 dark:text-green-400';
      case 'content_manager':
        return 'text-orange-600 dark:text-orange-400';
      case 'blogger':
        return 'text-pink-600 dark:text-pink-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="p-2 pl-4">{staff.email}</td>
      <td className="p-2">{getDisplayName()}</td>
      <td className="p-2">
        <span className={`font-medium ${getRoleColor(staff.role)}`}>
          {isTargetSuperAdmin 
            ? "Super Admin" 
            : ROLE_DISPLAY_NAMES[staff.role as StaffRole] || staff.role}
        </span>
      </td>
      <td className="p-2 pr-4 whitespace-nowrap">
        <div className="flex flex-row gap-2 justify-end items-center">
          {isTargetSuperAdmin ? (
            <span className="text-sm text-gray-500 italic px-2">Super Admin cannot be modified</span>
          ) : (
            <>
              <StaffMemberPasswordResetButton
                staff={staff}
                currentUserRole={currentUserRole}
                canSendReset={canSendPasswordReset}
                isTargetSuperAdmin={isTargetSuperAdmin} // Pass this, though canSendReset already considers it
                disabled={isProcessing}
                onUpdate={onUpdate}
                setParentIsSendingReset={setIsSendingReset}
              />
              
              <StaffMemberRoleSelect
                staff={staff}
                currentUserRole={currentUserRole}
                canModify={canModifyDetails}
                disabled={isProcessing}
                onUpdate={onUpdate}
                setParentIsUpdatingRole={setIsUpdatingRole}
              />
              
              <StaffMemberRemoveButton
                staff={staff}
                currentUserRole={currentUserRole}
                canRemove={canModifyDetails} // Remove action shares permission with role modification
                disabled={isProcessing}
                onUpdate={onUpdate}
              />
              
              {!canModifyDetails && !canSendPasswordReset && (
                 <span className="text-sm text-gray-500 italic px-2">No permission</span>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default StaffMemberRow;
