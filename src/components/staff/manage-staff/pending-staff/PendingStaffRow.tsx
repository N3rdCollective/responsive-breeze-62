
import { formatDistanceToNow } from "date-fns";
import { PendingStaffMember } from "../types/pendingStaffTypes";
import StaffActionButtons from "./StaffActionButtons";

interface PendingStaffRowProps {
  staff: PendingStaffMember;
  processingId: string | null;
  onApproveReject: (pendingId: string, approved: boolean, currentUserRole: string, assignRole?: string) => Promise<void>;
  currentUserRole: string;
}

const PendingStaffRow = ({ 
  staff, 
  processingId, 
  onApproveReject, 
  currentUserRole 
}: PendingStaffRowProps) => {
  const timeAgo = formatDistanceToNow(new Date(staff.invited_at), { addSuffix: true });
  
  const canManageStaff = currentUserRole === 'admin' || currentUserRole === 'super_admin';
  
  const handleApproveReject = async (pendingId: string, approved: boolean, role?: string) => {
    await onApproveReject(pendingId, approved, currentUserRole, role);
  };
  
  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="p-2 pl-4">{staff.email}</td>
      <td className="p-2">
        <span className="capitalize">
          {staff.status} {timeAgo}
        </span>
      </td>
      <td className="p-2 pr-4">
        <StaffActionButtons
          staffId={staff.id}
          status={staff.status}
          processingId={processingId}
          canManageStaff={canManageStaff}
          onApproveReject={handleApproveReject}
        />
      </td>
    </tr>
  );
};

export default PendingStaffRow;
