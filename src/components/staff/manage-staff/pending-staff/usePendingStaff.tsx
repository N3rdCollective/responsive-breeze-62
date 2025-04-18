
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
      // Now this will respect RLS policies, only retrieving data the user is allowed to see
      const { data, error } = await supabase
        .from("pending_staff")
        .select("*")
        .not("status", "eq", "approved") // Filter out approved staff
        .order("invited_at", { ascending: false });

      if (error) {
        console.error("Error fetching pending staff:", error);
        throw error;
      }

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
      
      // Call the approve-staff edge function
      const response = await supabase.functions.invoke('approve-staff', {
        body: { pendingId, approved, currentUserRole }
      });
      
      if (response.error) {
        console.error("Edge function error:", response.error);
        throw new Error(response.error.message || "Failed to process request");
      }
      
      const data = response.data;
      
      // Log the staff approval/rejection action
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Find the pending staff email
        const pendingStaffMember = pendingStaff.find(staff => staff.id === pendingId);
        
        await supabase.rpc("create_activity_log", {
          p_staff_id: session.user.id,
          p_action_type: approved ? "approve_staff" : "reject_staff",
          p_description: `${approved ? "Approved" : "Rejected"} staff invitation for ${pendingStaffMember?.email || "unknown email"}`,
          p_entity_type: "staff",
          p_entity_id: pendingId,
          p_details: JSON.stringify({
            email: pendingStaffMember?.email,
            status: pendingStaffMember?.status,
            newStatus: approved ? "approved" : "rejected"
          })
        });
      }
      
      // Show success message
      toast({
        title: approved ? "Staff Approved" : "Staff Rejected",
        description: data.message,
      });
      
      // Refresh data
      fetchPendingStaff();
      onStaffUpdate();
      
    } catch (error: any) {
      console.error("Error processing staff action:", error);
      toast({
        title: "Error",
        description: `Failed to ${approved ? 'approve' : 'reject'} staff member. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return {
    pendingStaff,
    loading,
    processingId,
    handleApproveReject,
    fetchPendingStaff
  };
};
