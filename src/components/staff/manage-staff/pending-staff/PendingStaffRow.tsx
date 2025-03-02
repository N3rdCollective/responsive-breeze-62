
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import StaffActionButtons from './StaffActionButtons';
import { PendingStaffMember } from '../types/pendingStaffTypes';

interface PendingStaffRowProps {
  staff: PendingStaffMember;
  processingId: string | null;
  canManageStaff: boolean;
  onApproveReject: (pendingId: string, approved: boolean) => Promise<void>;
}

const PendingStaffRow: React.FC<PendingStaffRowProps> = ({ 
  staff, 
  processingId, 
  canManageStaff, 
  onApproveReject 
}) => {
  return (
    <TableRow>
      <TableCell>{staff.email}</TableCell>
      <TableCell>
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
          staff.status === 'approved' ? 'bg-green-100 text-green-800' : 
          staff.status === 'rejected' ? 'bg-red-100 text-red-800' : 
          'bg-yellow-100 text-yellow-800'
        }`}>
          {staff.status.charAt(0).toUpperCase() + staff.status.slice(1)}
        </span>
      </TableCell>
      <TableCell>{format(new Date(staff.invited_at), 'MMM d, yyyy')}</TableCell>
      <TableCell>
        <StaffActionButtons 
          staffId={staff.id}
          status={staff.status}
          processingId={processingId}
          canManageStaff={canManageStaff}
          onApproveReject={onApproveReject}
        />
      </TableCell>
    </TableRow>
  );
};

export default PendingStaffRow;
