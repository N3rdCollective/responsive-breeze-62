
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StaffMember, StaffRole, ROLE_DISPLAY_NAMES } from "../types/pendingStaffTypes";
import { useToast } from "@/hooks/use-toast"; // Using hook directly for simplicity here
import { useStaffActivityLogger } from "@/hooks/useStaffActivityLogger"; // Using hook directly

interface StaffMemberRoleSelectProps {
  staff: StaffMember;
  currentUserRole: string;
  canModify: boolean;
  disabled: boolean;
  onUpdate: () => void;
  setParentIsUpdatingRole: (isUpdating: boolean) => void;
}

const StaffMemberRoleSelect: React.FC<StaffMemberRoleSelectProps> = ({
  staff,
  currentUserRole,
  canModify,
  disabled,
  onUpdate,
  setParentIsUpdatingRole,
}) => {
  const { toast } = useToast();
  const { logActivity } = useStaffActivityLogger();

  const handleRoleChange = async (newRole: string) => {
    if (!canModify) return;

    setParentIsUpdatingRole(true);
    try {
      const { error } = await supabase
        .from("staff")
        .update({ role: newRole })
        .eq("id", staff.id);

      if (error) throw error;

      await logActivity(
        "update_staff",
        `Changed role for ${staff.email} from ${ROLE_DISPLAY_NAMES[staff.role as StaffRole] || staff.role} to ${ROLE_DISPLAY_NAMES[newRole as StaffRole] || newRole}`,
        "staff",
        staff.id,
        {
          email: staff.email,
          previous_role: staff.role,
          new_role: newRole,
          modified_by: currentUserRole,
        }
      );

      toast({
        title: "Role Updated",
        description: `${staff.email} is now a ${ROLE_DISPLAY_NAMES[newRole as StaffRole] || newRole}.`,
      });

      onUpdate();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update staff role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setParentIsUpdatingRole(false);
    }
  };

  if (!canModify) {
    return null;
  }

  return (
    <Select
      disabled={disabled}
      defaultValue={staff.role}
      onValueChange={handleRoleChange}
    >
      <SelectTrigger className="w-36">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="staff">Staff</SelectItem>
        <SelectItem value="blogger">Blogger</SelectItem>
        <SelectItem value="content_manager">Content Manager</SelectItem>
        <SelectItem value="moderator">Moderator</SelectItem>
        {currentUserRole === "super_admin" && (
          <SelectItem value="admin">Admin</SelectItem>
        )}
      </SelectContent>
    </Select>
  );
};

export default StaffMemberRoleSelect;
