
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PendingStaffRow from './PendingStaffRow';
import { PendingStaffMember } from '../types/pendingStaffTypes';

interface PendingStaffDataTableProps {
  pendingStaff: PendingStaffMember[];
  processingId: string | null;
  canManageStaff: boolean;
  onApproveReject: (pendingId: string, approved: boolean) => Promise<void>;
}

const PendingStaffDataTable: React.FC<PendingStaffDataTableProps> = ({ 
  pendingStaff, 
  processingId, 
  canManageStaff, 
  onApproveReject 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Pending Staff</h3>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invited On</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingStaff.map((staff) => (
              <PendingStaffRow
                key={staff.id}
                staff={staff}
                processingId={processingId}
                canManageStaff={canManageStaff}
                onApproveReject={onApproveReject}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PendingStaffDataTable;
