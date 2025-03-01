
import { useState } from "react";
import StaffMemberRow from "./StaffMemberRow";

interface StaffMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string | null;
}

interface StaffTableProps {
  staffMembers: StaffMember[];
  loading: boolean;
  onStaffUpdate: () => void;
}

const StaffTable = ({ staffMembers, loading, onStaffUpdate }: StaffTableProps) => {
  return (
    <div className="border rounded-md">
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
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-2 pl-4">Email</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Role</th>
              <th className="p-2" colSpan={2}></th>
            </tr>
          </thead>
          <tbody>
            {staffMembers.map((staff) => (
              <StaffMemberRow 
                key={staff.id} 
                staff={staff} 
                onUpdate={onStaffUpdate} 
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StaffTable;
