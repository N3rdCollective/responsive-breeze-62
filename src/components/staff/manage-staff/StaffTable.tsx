
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import StaffMemberRow from "./StaffMemberRow";
import { StaffMember } from "./types/pendingStaffTypes";

interface StaffTableProps {
  staffMembers: StaffMember[];
  loading: boolean;
  onStaffUpdate: () => void;
  currentUserRole: string;
}

const StaffTable: React.FC<StaffTableProps> = ({
  staffMembers,
  loading,
  onStaffUpdate,
  currentUserRole
}) => {
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [sendingResetId, setSendingResetId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="border rounded-md p-6 sm:p-8">
        <div className="text-center text-muted-foreground">Loading staff members...</div>
      </div>
    );
  }

  if (staffMembers.length === 0) {
    return (
      <div className="border rounded-md p-6 sm:p-8">
        <div className="text-center text-muted-foreground">No staff members found.</div>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[120px]">Name</TableHead>
              <TableHead className="min-w-[200px] hidden sm:table-cell">Email</TableHead>
              <TableHead className="min-w-[100px]">Role</TableHead>
              <TableHead className="min-w-[100px] hidden md:table-cell">Joined</TableHead>
              <TableHead className="text-right min-w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffMembers.map((member) => (
              <StaffMemberRow
                key={member.id}
                staff={member}
                currentUserRole={currentUserRole}
                onUpdate={onStaffUpdate}
                isUpdatingRole={updatingRoleId === member.id}
                setIsUpdatingRole={(isUpdating) => setUpdatingRoleId(isUpdating ? member.id : null)}
                isSendingReset={sendingResetId === member.id}
                setIsSendingReset={(isSending) => setSendingResetId(isSending ? member.id : null)}
                isRemoving={removingId === member.id}
                setIsRemoving={(isRemoving) => setRemovingId(isRemoving ? member.id : null)}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StaffTable;
