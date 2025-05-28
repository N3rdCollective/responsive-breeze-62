
import React from "react";
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import StaffMemberRow from "./StaffMemberRow";

interface StaffMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

interface StaffTableProps {
  staffMembers: StaffMember[];
  currentUserRole: string;
  onRoleChange: (staffId: string, newRole: string) => void;
  onRemoveStaff: (staffId: string) => void;
  onResetPassword: (staffId: string) => void;
}

const StaffTable: React.FC<StaffTableProps> = ({
  staffMembers,
  currentUserRole,
  onRoleChange,
  onRemoveStaff,
  onResetPassword
}) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staffMembers.map((member) => (
            <StaffMemberRow
              key={member.id}
              member={member}
              currentUserRole={currentUserRole}
              onRoleChange={onRoleChange}
              onRemoveStaff={onRemoveStaff}
              onResetPassword={onResetPassword}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StaffTable;
