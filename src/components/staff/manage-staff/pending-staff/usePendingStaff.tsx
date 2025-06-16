
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PendingStaffMember {
  id: string;
  email: string;
  status: string;
  invited_at: string;
  approved_at?: string;
  rejected_at?: string;
}

export const usePendingStaff = (onStaffUpdate: () => void) => {
  const [pendingStaff, setPendingStaff] = useState<PendingStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingStaff = async () => {
    try {
      const { data, error } = await supabase
        .from("pending_staff")
        .select("*")
        .eq("status", "invited")
        .order("invited_at", { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.id,
        email: item.email,
        status: item.status,
        invited_at: item.invited_at,
        approved_at: item.approved_at,
        rejected_at: item.rejected_at,
      })) || [];

      setPendingStaff(formattedData);
    } catch (error) {
      console.error("Error fetching pending staff:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending staff invitations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (pendingId: string, approved: boolean, currentUserRole: string) => {
    setProcessingId(pendingId);
    
    try {
      const { error } = await supabase
        .from("pending_staff")
        .update({ 
          status: approved ? "approved" : "rejected",
          approved_at: approved ? new Date().toISOString() : null,
          rejected_at: approved ? null : new Date().toISOString(),
        })
        .eq("id", pendingId);

      if (error) throw error;

      toast({
        title: approved ? "Invitation Approved" : "Invitation Rejected",
        description: `Staff invitation has been ${approved ? 'approved' : 'rejected'}.`,
      });

      // Refresh both pending staff and main staff list
      await fetchPendingStaff();
      onStaffUpdate();
    } catch (error) {
      console.error("Error processing invitation:", error);
      toast({
        title: "Error",
        description: "Failed to process the invitation",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchPendingStaff();
  }, []);

  return {
    pendingStaff,
    loading,
    processingId,
    handleApproveReject,
    fetchPendingStaff
  };
};
