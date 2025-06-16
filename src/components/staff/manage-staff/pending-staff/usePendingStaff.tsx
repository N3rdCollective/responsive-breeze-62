
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PendingStaffMember {
  id: string;
  email: string;
  role: string;
  invited_by: string;
  created_at: string;
  inviter_name?: string;
}

export const usePendingStaff = (onStaffUpdate: () => void) => {
  const [pendingStaff, setPendingStaff] = useState<PendingStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingStaff = async () => {
    try {
      const { data, error } = await supabase
        .from("staff_invitations")
        .select(`
          *,
          inviter:invited_by (
            first_name,
            last_name,
            email
          )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.id,
        email: item.email,
        role: item.role,
        invited_by: item.invited_by,
        created_at: item.created_at,
        inviter_name: item.inviter ? `${item.inviter.first_name || ''} ${item.inviter.last_name || ''}`.trim() || item.inviter.email : 'Unknown'
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
        .from("staff_invitations")
        .update({ 
          status: approved ? "approved" : "rejected",
          updated_at: new Date().toISOString()
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
