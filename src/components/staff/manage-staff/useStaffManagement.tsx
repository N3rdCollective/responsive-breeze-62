
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StaffMember } from "./types/pendingStaffTypes";

const useStaffManagement = (isModalOpen: boolean) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStaffMembers = async () => {
    try {
      console.log("useStaffManagement: Fetching staff members");
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .order("role", { ascending: false })
        .order("email", { ascending: true });
      
      if (error) {
        console.error("useStaffManagement: Fetch error:", error);
        throw error;
      }
      
      console.log("useStaffManagement: Staff data fetched:", data?.length || 0, "records");
      setStaffMembers(data || []);
    } catch (error) {
      console.error("useStaffManagement: Error fetching staff:", error);
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      console.log("useStaffManagement: Modal opened, fetching staff");
      fetchStaffMembers();
    }
  }, [isModalOpen]);

  return {
    staffMembers,
    loading,
    fetchStaffMembers,
    error
  };
};

export default useStaffManagement;
