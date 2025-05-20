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
      <td className="p-2 pl-4 break-all">{staff.email}</td> {/* Added break-all for long emails */}
      <td className="p-2">{getDisplayName()}</td>
      <td className="p-2">
        {isTargetSuperAdmin ? (
          <span className={`font-medium ${getRoleColor(staff.role)}`}>
            Super Admin
          </span>
        ) : canModifyDetails ? (
          <StaffMemberRoleSelect
            staff={staff}
            currentUserRole={currentUserRole}
            canModify={canModifyDetails} // This is true here
            disabled={isProcessing || isTargetSuperAdmin} // Disable if super admin, though covered by outer condition
            onUpdate={onUpdate}
            setParentIsUpdatingRole={setIsUpdatingRole}
          />
        ) : (
          <span className={`font-medium ${getRoleColor(staff.role)}`}>
            {ROLE_DISPLAY_NAMES[staff.role as StaffRole] || staff.role}
          </span>
        )}
      </td>
      <td className="p-2 pr-4"> {/* Removed whitespace-nowrap */}
        <div className="flex flex-wrap gap-2 justify-end items-center"> {/* Added flex-wrap */}
          {isTargetSuperAdmin ? (
            <span className="text-sm text-gray-500 italic px-2">Super Admin cannot be modified</span>
          ) : (
            <>
              <StaffMemberPasswordResetButton
                staff={staff}
                currentUserRole={currentUserRole}
                canSendReset={canSendPasswordReset}
                isTargetSuperAdmin={isTargetSuperAdmin}
                disabled={isProcessing}
                onUpdate={onUpdate}
                setParentIsSendingReset={setIsSendingReset}
              />
              
              <StaffMemberRemoveButton
                staff={staff}
                currentUserRole={currentUserRole}
                canRemove={canModifyDetails}
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
