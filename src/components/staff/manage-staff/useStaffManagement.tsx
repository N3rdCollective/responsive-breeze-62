
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StaffMember } from "./types/pendingStaffTypes";

const useStaffManagement = (isModalOpen: boolean) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .order("role", { ascending: false })
        .order("email", { ascending: true });
      
      if (error) throw error;
      
      setStaffMembers(data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchStaffMembers();
    }
  }, [isModalOpen]);

  return {
    staffMembers,
    loading,
    fetchStaffMembers
  };
};

export default useStaffManagement;
