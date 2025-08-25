
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StaffMember } from "./types/pendingStaffTypes";

const useStaffManagement = (isModalOpen: boolean) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      
      // Use secure function that doesn't expose emails in regular staff list
      const { data, error } = await supabase
        .rpc("get_staff_management_list");
      
      if (error) throw error;
      
      // Map the secure data to include email placeholder for UI compatibility
      const staffWithPlaceholders = (data || []).map(staff => ({
        ...staff,
        email: "***@***.***", // Placeholder - real emails require HR access
        display_name: null, // Not available in secure list
        first_name: null, // Not available in secure list
        last_name: null // Not available in secure list
      }));
      
      setStaffMembers(staffWithPlaceholders);
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
