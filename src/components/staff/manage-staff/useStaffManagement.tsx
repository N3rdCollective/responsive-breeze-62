
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
      
      // First get current user's role to determine what data they can see
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("useStaffManagement: No session found");
        throw new Error("Authentication required");
      }
      
      console.log("useStaffManagement: Current user ID:", session.user.id);
      
      // Get current user's role
      const { data: currentUserData, error: currentUserError } = await supabase
        .from("staff")
        .select("role")
        .eq("id", session.user.id)
        .single();
        
      if (currentUserError) {
        console.error("useStaffManagement: Error fetching current user:", currentUserError);
        throw currentUserError;
      }
      
      if (!currentUserData) {
        console.log("useStaffManagement: Current user not found in staff table");
        throw new Error("User not found in staff table");
      }
      
      console.log("useStaffManagement: Current user role:", currentUserData.role);
      
      const isDJEpidemik = session.user.email?.toLowerCase().includes("djepide") || 
                          session.user.email?.toLowerCase().includes("dj_epide");
                          
      const currentRole = isDJEpidemik ? "super_admin" : currentUserData.role;
      
      console.log("useStaffManagement: Effective role:", currentRole);
      
      // Now fetch staff data based on role
      let query = supabase
        .from("staff")
        .select("*");
        
      // Regular staff can't see admin users
      if (currentRole === "staff" || currentRole === "moderator") {
        console.log("useStaffManagement: Limited view for staff/moderator");
        query = query.neq("role", "admin").neq("role", "super_admin");
      }
      
      // Order results
      const { data, error } = await query
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
