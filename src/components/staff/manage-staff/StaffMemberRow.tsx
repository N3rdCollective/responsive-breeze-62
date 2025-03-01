
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StaffMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string | null;
}

interface StaffMemberRowProps {
  staff: StaffMember;
  onUpdate: () => void;
}

const StaffMemberRow = ({ staff, onUpdate }: StaffMemberRowProps) => {
  const [isUpdatingRole, setIsUpdatingRole] = useState<boolean>(false);
  const { toast } = useToast();

  const handleToggleAdmin = async (id: string, email: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "staff" : "admin";
    const actionText = newRole === "admin" ? "an administrator" : "a regular staff member";
    
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

  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="p-2 pl-4">{staff.email}</td>
      <td className="p-2">
        {staff.first_name || staff.last_name 
          ? `${staff.first_name || ''} ${staff.last_name || ''}`.trim() 
          : '-'}
      </td>
      <td className="p-2 capitalize">{staff.role}</td>
      <td className="p-2 whitespace-nowrap">
        <div className="flex flex-row gap-2 justify-end">
          <Button 
            variant="outline" 
            size="sm"
            className={`${staff.role === "admin" ? "text-yellow-600 dark:text-yellow-400" : "text-blue-600 dark:text-blue-400"}`}
            onClick={() => handleToggleAdmin(staff.id, staff.email, staff.role)}
            disabled={isUpdatingRole}
          >
            {isUpdatingRole ? "Updating..." : 
              staff.role === "admin" ? "Remove Admin" : "Make Admin"}
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
        </div>
      </td>
    </tr>
  );
};

export default StaffMemberRow;
