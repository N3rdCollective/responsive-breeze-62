
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  StaffMember, 
  StaffRole, 
  ROLE_DISPLAY_NAMES, 
  ROLE_PERMISSIONS 
} from "./types/pendingStaffTypes";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface StaffMemberRowProps {
  staff: StaffMember;
  onUpdate: () => void;
  currentUserRole: string;
}

const StaffMemberRow = ({ staff, onUpdate, currentUserRole }: StaffMemberRowProps) => {
  const [isUpdatingRole, setIsUpdatingRole] = useState<boolean>(false);
  const { toast } = useToast();

  const isSuperAdmin = staff.role === "super_admin" || 
                      staff.email.toLowerCase().includes("djepide") ||
                      staff.email.toLowerCase().includes("dj_epide");
  
  const canModify = (currentUserRole === "admin" || currentUserRole === "super_admin") && 
                  !isSuperAdmin &&
                  (staff.role !== "admin" || currentUserRole === "super_admin");

  const handleRoleChange = async (newRole: string) => {
    if (!canModify) return;
    
    try {
      setIsUpdatingRole(true);
      
      const { error } = await supabase
        .from("staff")
        .update({ role: newRole })
        .eq("id", staff.id);
      
      if (error) throw error;
      
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
          {isSuperAdmin 
            ? "Super Admin" 
            : ROLE_DISPLAY_NAMES[staff.role as StaffRole] || staff.role}
        </span>
      </td>
      <td className="p-2 pr-4 whitespace-nowrap">
        <div className="flex flex-row gap-2 justify-end">
          {isSuperAdmin ? (
            <span className="text-sm text-gray-500 italic px-2">Super Admin cannot be modified</span>
          ) : canModify ? (
            <>
              <Select
                disabled={isUpdatingRole}
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
                disabled={isUpdatingRole}
              >
                Remove
              </Button>
            </>
          ) : (
            <span className="text-sm text-gray-500 italic px-2">No permission</span>
          )}
        </div>
      </td>
    </tr>
  );
};

export default StaffMemberRow;
