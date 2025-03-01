
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StaffMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string | null;
}

export const useStaffManagement = (isModalOpen: boolean) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isModalOpen) {
      fetchStaffMembers();
    }
  }, [isModalOpen]);

  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("staff").select("*");
      
      if (error) {
        throw error;
      }
      
      setStaffMembers(data || []);
    } catch (error) {
      console.error("Error fetching staff members:", error);
      toast({
        title: "Error",
        description: "Failed to load staff members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    staffMembers,
    loading,
    fetchStaffMembers
  };
};

export default useStaffManagement;
