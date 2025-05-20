import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { StaffMember } from "../types/pendingStaffTypes";
import { useToast } from "@/hooks/use-toast";
import { useStaffActivityLogger } from "@/hooks/useStaffActivityLogger";
import { X } from "lucide-react"; // Import X icon
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface StaffMemberRemoveButtonProps {
  staff: StaffMember;
  currentUserRole: string;
  canRemove: boolean;
  disabled: boolean;
  onUpdate: () => void;
}

const StaffMemberRemoveButton: React.FC<StaffMemberRemoveButtonProps> = ({
  staff,
  currentUserRole,
  canRemove,
  disabled,
  onUpdate,
}) => {
  const { toast } = useToast();
  const { logActivity } = useStaffActivityLogger();

  const handleRemoveStaff = async () => {
    if (!canRemove) return;
    if (!confirm(`Are you sure you want to remove ${staff.email} from staff?`)) {
      return;
    }

    // No specific loading state for remove in original, but it is disabled by parent.
    // If a loading state is desired, it would be set here.
    try {
      const { error } = await supabase
        .from("staff")
        .delete()
        .eq("id", staff.id);

      if (error) throw error;

      await logActivity(
        "delete_staff",
        `Removed staff member: ${staff.email}`,
        "staff",
        staff.id,
        { email: staff.email, previous_role: staff.role, removed_by: currentUserRole }
      );

      toast({
        title: "Staff Removed",
        description: `${staff.email} has been removed from staff.`,
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

  if (!canRemove) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon" // Changed to icon size
            className="h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" // Adjusted size and kept colors
            onClick={handleRemoveStaff}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove Staff Member</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Remove Staff Member</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StaffMemberRemoveButton;
