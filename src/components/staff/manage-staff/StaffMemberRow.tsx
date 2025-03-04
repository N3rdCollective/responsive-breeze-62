import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { StaffMember } from "./types/pendingStaffTypes";

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

  const handleToggleRole = async (id: string, email: string, currentRole: string) => {
    let newRole = "moderator";
    
    if (currentRole === "moderator") {
      newRole = "admin";
    } else if (currentRole === "admin") {
      newRole = "moderator";
    }
    
    const actionText = `a${newRole === "admin" ? "n" : ""} ${newRole}`;
    
    try {
      setIsUpdatingRole(true);
      
      const { error } = await supabase
        .from("staff")
        .update({ role: newRole })
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Role Updated",
        description: `${email} is now ${actionText}.`,
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

  const getRoleButtonText = (role: string) => {
    if (isUpdatingRole) return "Updating...";
    
    if (role === "admin") return "Make Moderator";
    if (role === "moderator") return "Make Admin";
    return "Make Moderator"; // Default for "staff" role
  };

  const getDisplayName = () => {
    if (staff.display_name) {
      return staff.display_name;
    }
    return (staff.first_name || staff.last_name 
      ? `${staff.first_name || ''} ${staff.last_name || ''}`.trim() 
      : '-');
  };

  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="p-2 pl-4">{staff.email}</td>
      <td className="p-2">{getDisplayName()}</td>
      <td className="p-2 capitalize">
        {isSuperAdmin ? (
          <span className="font-semibold text-purple-600 dark:text-purple-400">Super Admin</span>
        ) : (
          staff.role
        )}
      </td>
      <td className="p-2 pr-4 whitespace-nowrap">
        <div className="flex flex-row gap-2 justify-end">
          {isSuperAdmin ? (
            <span className="text-sm text-gray-500 italic px-2">Super Admin cannot be modified</span>
          ) : canModify ? (
            <>
              <Button 
                variant="outline" 
                size="sm"
                className={`${staff.role === "admin" ? "text-yellow-600 dark:text-yellow-400" : 
                  staff.role === "moderator" ? "text-blue-600 dark:text-blue-400" :
                  "text-green-600 dark:text-green-400"}`}
                onClick={() => handleToggleRole(staff.id, staff.email, staff.role)}
                disabled={isUpdatingRole}
              >
                {getRoleButtonText(staff.role)}
              </Button>
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
