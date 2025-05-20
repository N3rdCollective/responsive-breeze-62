
import { useState } from "react";
import StaffMemberRow from "./StaffMemberRow";
import { StaffMember } from "./types/pendingStaffTypes";

interface StaffTableProps {
  staffMembers: StaffMember[];
  loading: boolean;
  onStaffUpdate: () => void;
  currentUserRole: string;
}

const StaffTable = ({ staffMembers, loading, onStaffUpdate, currentUserRole }: StaffTableProps) => {
  return (
    <div className="border rounded-md overflow-x-auto">
      {loading ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading staff members...</p>
        </div>
      ) : staffMembers.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No staff members found.
        </div>
      ) : (
        <table className="w-full"> {/* Removed min-w-[600px] */}
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-2 pl-4 w-1/3">Email</th>
              <th className="text-left p-2 w-1/4">Name</th>
              <th className="text-left p-2 w-1/6">Role</th>
              <th className="p-2 text-right pr-4 w-1/4">Actions</th> {/* Added pr-4 for consistency */}
            </tr>
          </thead>
          <tbody>
            {staffMembers.map((staff) => (
              <StaffMemberRow 
                key={staff.id} 
                staff={staff} 
                onUpdate={onStaffUpdate}
                currentUserRole={currentUserRole}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StaffTable;
