
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PendingStaffMember } from '../types/pendingStaffTypes';

export const usePendingStaff = (onStaffUpdate: () => void) => {
  const [pendingStaff, setPendingStaff] = useState<PendingStaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingStaff = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pending_staff")
        .select("*")
        .order("invited_at", { ascending: false });

      if (error) throw error;
      
      // Ensure the status is properly typed
      const typedData = data?.map(item => ({
        ...item,
        status: item.status as 'invited' | 'approved' | 'rejected'
      })) || [];
      
      setPendingStaff(typedData);
    } catch (error) {
      console.error("Error fetching pending staff:", error);
      toast({
        title: "Error",
        description: "Failed to load pending staff members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingStaff();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('pending_staff_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'pending_staff' 
      }, () => {
        fetchPendingStaff();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleApproveReject = async (pendingId: string, approved: boolean, currentUserRole: string) => {
    try {
      setProcessingId(pendingId);
      
      const response = await supabase.functions.invoke('approve-staff', {
        body: { 
          pendingId,
          approved,
          currentUserRole 
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      toast({
        title: approved ? "Staff Approved" : "Staff Rejected",
        description: response.data.message,
      });
      
      fetchPendingStaff();
      onStaffUpdate();
    } catch (error: any) {
      console.error("Error processing staff:", error);
      toast({
        title: "Error",
        description: `Failed to ${approved ? 'approve' : 'reject'} staff: ${error.message}`,
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
    fetchPendingStaff,
    handleApproveReject
  };
};
