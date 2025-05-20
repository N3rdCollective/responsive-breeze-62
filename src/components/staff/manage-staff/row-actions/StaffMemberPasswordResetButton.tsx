import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { KeyRound } from "lucide-react";
import { StaffMember } from "../types/pendingStaffTypes";
import { useToast } from "@/hooks/use-toast";
import { useStaffActivityLogger } from "@/hooks/useStaffActivityLogger";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StaffMemberPasswordResetButtonProps {
  staff: StaffMember;
  currentUserRole: string;
  canSendReset: boolean;
  isTargetSuperAdmin: boolean;
  disabled: boolean;
  onUpdate: () => void;
  setParentIsSendingReset: (isSending: boolean) => void;
}

const StaffMemberPasswordResetButton: React.FC<StaffMemberPasswordResetButtonProps> = ({
  staff,
  currentUserRole,
  canSendReset,
  isTargetSuperAdmin,
  disabled,
  onUpdate,
  setParentIsSendingReset,
}) => {
  const { toast } = useToast();
  const { logActivity } = useStaffActivityLogger();

  const handleSendPasswordReset = async () => {
    if (!canSendReset || isTargetSuperAdmin) {
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

    setParentIsSendingReset(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("Not authenticated");
      }
      const token = sessionData.session.access_token;

      const response = await supabase.functions.invoke("send-staff-password-reset", {
        body: { staffUserId: staff.id },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);

      toast({
        title: "Password Reset Email Sent",
        description: `An email has been sent to ${staff.email} with instructions to reset their password.`,
      });
      await logActivity(
        "send_password_reset",
        `Sent password reset email to ${staff.email}`,
        "staff",
        staff.id,
        { email: staff.email, initiated_by_role: currentUserRole }
      );
      // onUpdate(); // Call if a table refresh or parent state change is needed
    } catch (error: any) {
      console.error("Error sending password reset:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setParentIsSendingReset(false);
    }
  };

  if (!canSendReset) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon" // Changed to icon size
            onClick={handleSendPasswordReset}
            disabled={disabled}
            className="h-8 w-8" // Adjust size as needed
          >
            <KeyRound className="h-4 w-4" />
            <span className="sr-only">Reset Password</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reset Password</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StaffMemberPasswordResetButton;
