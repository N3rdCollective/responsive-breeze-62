
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PendingStaffMember } from "../types/pendingStaffTypes";

const canManageStaff = (currentUserRole: string) => {
  return currentUserRole === "admin" || currentUserRole === "super_admin";
};

export const usePendingStaff = (onStaffUpdate: () => void) => {
  const [pendingStaff, setPendingStaff] = useState<PendingStaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingStaff = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pending_staff")
        .select("*")
        .order("invited_at", { ascending: false });

      if (error) throw error;

      // Type casting to ensure status is one of the allowed values
      const typedData = data?.map(item => ({
        ...item,
        status: item.status as 'invited' | 'approved' | 'rejected' | 'requested'
      })) || [];
      
      setPendingStaff(typedData);
    } catch (error) {
      console.error("Error fetching pending staff:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending staff. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStaff();
  }, []);

  const handleApproveReject = async (pendingId: string, approved: boolean, currentUserRole: string) => {
    if (!canManageStaff(currentUserRole)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to manage staff members.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setProcessingId(pendingId);
      
      // Get the pending staff record
      const { data: pendingStaffData, error: fetchError } = await supabase
        .from("pending_staff")
        .select("*")
        .eq("id", pendingId)
        .single();
      
      if (fetchError || !pendingStaffData) {
        throw new Error("Failed to fetch pending staff record");
      }
      
      // Type cast the status to match our expected type
      const pendingStaffMember: PendingStaffMember = {
        ...pendingStaffData,
        status: pendingStaffData.status as 'invited' | 'approved' | 'rejected' | 'requested'
      };
      
      // Handle based on status - this now handles both invited and requested statuses
      if (approved) {
        // If invited or requested and approved, move to staff
        await handleApproval(pendingStaffMember);
      } else {
        // If rejected, update pending_staff status
        await handleRejection(pendingStaffMember);
      }
      
      fetchPendingStaff();
      onStaffUpdate();
      
    } catch (error) {
      console.error("Error processing staff action:", error);
      toast({
        title: "Error",
        description: "Failed to process this action. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleApproval = async (pendingStaff: PendingStaffMember) => {
    try {
      // Create staff record
      const { error: staffError } = await supabase
        .from("staff")
        .insert({
          id: pendingStaff.email, // Use email as ID
          email: pendingStaff.email,
          role: "staff",
        });

      if (staffError) throw staffError;

      // Update pending_staff status to 'approved'
      const { error: updateError } = await supabase
        .from("pending_staff")
        .update({ status: "approved" })
        .eq("id", pendingStaff.id);

      if (updateError) throw updateError;

      toast({
        title: "Staff Approved",
        description: `${pendingStaff.email} has been approved and added to staff.`,
      });
    } catch (error) {
      console.error("Error approving staff:", error);
      toast({
        title: "Error",
        description: "Failed to approve staff member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejection = async (pendingStaff: PendingStaffMember) => {
    try {
      // Update pending_staff status to 'rejected'
      const { error: rejectError } = await supabase
        .from("pending_staff")
        .update({ status: "rejected" })
        .eq("id", pendingStaff.id);

      if (rejectError) throw rejectError;

      toast({
        title: "Staff Rejected",
        description: `${pendingStaff.email} has been rejected.`,
      });
    } catch (error) {
      console.error("Error rejecting staff:", error);
      toast({
        title: "Error",
        description: "Failed to reject staff member. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    pendingStaff,
    loading,
    processingId,
    handleApproveReject
  };
};
