
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import StaffMemberRoleSelect from "./row-actions/StaffMemberRoleSelect";
import StaffMemberPasswordResetButton from "./row-actions/StaffMemberPasswordResetButton";
import StaffMemberRemoveButton from "./row-actions/StaffMemberRemoveButton";

interface StaffMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

interface StaffMemberRowProps {
  member: StaffMember;
  currentUserRole: string;
  onRoleChange: (staffId: string, newRole: string) => void;
  onRemoveStaff: (staffId: string) => void;
  onResetPassword: (staffId: string) => void;
}

const StaffMemberRow: React.FC<StaffMemberRowProps> = ({
  member,
  currentUserRole,
  onRoleChange,
  onRemoveStaff,
  onResetPassword
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        {member.first_name} {member.last_name}
      </TableCell>
      <TableCell>{member.email}</TableCell>
      <TableCell>
        <StaffMemberRoleSelect
          staffId={member.id}
          currentRole={member.role}
          currentUserRole={currentUserRole}
          onRoleChange={onRoleChange}
        />
      </TableCell>
      <TableCell>{formatDate(member.created_at)}</TableCell>
      <TableCell className="text-right space-x-2">
        <StaffMemberPasswordResetButton
          staffId={member.id}
          onResetPassword={onResetPassword}
        />
        <StaffMemberRemoveButton
          staffId={member.id}
          staffName={`${member.first_name} ${member.last_name}`}
          currentUserRole={currentUserRole}
          staffRole={member.role}
          onRemoveStaff={onRemoveStaff}
        />
      </TableCell>
    </TableRow>
  );
};

export default StaffMemberRow;
