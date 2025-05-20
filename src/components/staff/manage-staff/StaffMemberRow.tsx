import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  StaffMember, 
  StaffRole, 
  ROLE_DISPLAY_NAMES, 
  // ROLE_PERMISSIONS // Not directly used here for password reset logic
} from "./types/pendingStaffTypes";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useStaffActivityLogger } from "@/hooks/useStaffActivityLogger";
import { KeyRound } from 'lucide-react'; // Icon for password reset

interface StaffMemberRowProps {
  staff: StaffMember;
  onUpdate: () => void;
  currentUserRole: string;
}

const StaffMemberRow = ({ staff, onUpdate, currentUserRole }: StaffMemberRowProps) => {
  const [isUpdatingRole, setIsUpdatingRole] = useState<boolean>(false);
  const [isSendingReset, setIsSendingReset] = useState<boolean>(false);
  const { toast } = useToast();
  const { logActivity } = useStaffActivityLogger();

  const isTargetSuperAdmin = staff.role === "super_admin" || 
                         staff.email.toLowerCase().includes("djepide") || // Legacy check, role should be definitive
                         staff.email.toLowerCase().includes("dj_epide");  // Legacy check

  // Can current user modify this staff member's role or remove them?
  const canModifyDetails = 
    (currentUserRole === "admin" || currentUserRole === "super_admin") && 
    !isTargetSuperAdmin &&
    (staff.role !== "admin" || currentUserRole === "super_admin");

  // Can current user send a password reset for this staff member?
  const canSendPasswordReset = 
    (currentUserRole === "admin" || currentUserRole === "super_admin") &&
    !isTargetSuperAdmin && // Cannot reset super_admin's password
    (staff.role !== "admin" || currentUserRole === "super_admin"); // Admin cannot reset other admin, only super_admin can

  const handleRoleChange = async (newRole: string) => {
    if (!canModifyDetails) return;
    
    try {
      setIsUpdatingRole(true);
      
      const { error } = await supabase
        .from("staff")
        .update({ role: newRole })
        .eq("id", staff.id);
      
      if (error) throw error;
      
      // Log the staff role change
      await logActivity(
        "update_staff",
        `Changed role for ${staff.email} from ${ROLE_DISPLAY_NAMES[staff.role as StaffRole] || staff.role} to ${ROLE_DISPLAY_NAMES[newRole as StaffRole] || newRole}`,
        "staff",
        staff.id,
        {
          email: staff.email,
          previous_role: staff.role,
          new_role: newRole,
          modified_by: currentUserRole
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
      setIsUpdatingRole(false);
    }
  };

  const handleRemoveStaff = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from staff?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("staff")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Log the staff removal
      await logActivity(
        "delete_staff",
        `Removed staff member: ${email}`,
        "staff",
        id,
        {
          email: email,
          previous_role: staff.role,
          removed_by: currentUserRole
        }
      );
      
      toast({
        title: "Staff Removed",
        description: `${email} has been removed from staff.`,
      });
      
      onUpdate();
    } catch (error) {
      console.error("Error removing staff:", error);
      toast({
        title: "Error",
        description: "Failed to remove staff member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendPasswordReset = async () => {
    if (!canSendPasswordReset || isTargetSuperAdmin) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to reset this user's password or this action is not allowed for Super Admins.",
        variant: "destructive",
      });
      return;
    }
    if (!confirm(`Are you sure you want to send a password reset email to ${staff.email}?`)) {
      return;
    }

    setIsSendingReset(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("Not authenticated");
      }
      const token = sessionData.session.access_token;

      const response = await supabase.functions.invoke("send-staff-password-reset", {
        body: { staffUserId: staff.id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error); // Handle errors from function logic

      toast({
        title: "Password Reset Email Sent",
        description: `An email has been sent to ${staff.email} with instructions to reset their password.`,
      });
      await logActivity(
        "send_password_reset",
        `Sent password reset email to ${staff.email}`,
        "staff",
        staff.id,
        {
          email: staff.email,
          initiated_by_role: currentUserRole,
        }
      );
    } catch (error: any) {
      console.error("Error sending password reset:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingReset(false);
    }
  };


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
      <td className="p-2 pl-4">{staff.email}</td>
      <td className="p-2">{getDisplayName()}</td>
      <td className="p-2">
        <span className={`font-medium ${getRoleColor(staff.role)}`}>
          {isTargetSuperAdmin 
            ? "Super Admin" 
            : ROLE_DISPLAY_NAMES[staff.role as StaffRole] || staff.role}
        </span>
      </td>
      <td className="p-2 pr-4 whitespace-nowrap">
        <div className="flex flex-row gap-2 justify-end items-center">
          {isTargetSuperAdmin ? (
            <span className="text-sm text-gray-500 italic px-2">Super Admin cannot be modified</span>
          ) : (
            <>
              {canSendPasswordReset && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendPasswordReset}
                  disabled={isSendingReset || isUpdatingRole}
                  className="flex items-center"
                >
                  <KeyRound className="h-4 w-4 mr-1.5" />
                  Reset Pass
                </Button>
              )}
              {canModifyDetails && (
                <>
                  <Select
                    disabled={isUpdatingRole || isSendingReset}
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => handleRemoveStaff(staff.id, staff.email)}
                    disabled={isUpdatingRole || isSendingReset}
                  >
                    Remove
                  </Button>
                </>
              )}
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
