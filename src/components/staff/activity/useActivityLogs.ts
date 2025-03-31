
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export type ActivityLog = {
  id: string;
  created_at: string;
  staff_id: string;
  action_type: string;
  description: string;
  entity_type: string | null;
  entity_id: string | null;
  details: any | null;
  ip_address: string | null;
  staff_email?: string;
  staff_name?: string;
};

export type LogEdit = {
  id: string;
  created_at: string;
  edited_by: string;
  log_id: string;
  previous_values: any;
  new_values: any;
  edit_reason: string | null;
  editor_name?: string;
};

export const useActivityLogs = (limit = 100) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const formatLogDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (e) {
      return date;
    }
  };

  const fetchLogs = async () => {
    console.log("Fetching activity logs...");
    setIsLoading(true);
    setError(null);
    
    try {
      // Verify authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error("Auth error:", authError);
        throw new Error("Authentication error: " + authError.message);
      }
      
      if (!session) {
        console.error("No active session");
        throw new Error("No active session. Please log in.");
      }
      
      // Fetch logs with staff information
      console.log("Fetching logs with staff information...");
      const { data, error: fetchError } = await supabase
        .from("staff_activity_logs")
        .select(`
          *,
          staff:staff_id (
            email,
            first_name,
            last_name,
            display_name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (fetchError) {
        console.error("Fetch error:", fetchError);
        throw fetchError;
      }

      console.log("Fetched logs:", data?.length || 0);
      
      // Process logs for display
      const processedLogs = data?.map(log => ({
        ...log,
        staff_email: log.staff?.email || "Unknown",
        staff_name: log.staff?.display_name || 
                   (log.staff?.first_name && log.staff?.last_name) ? 
                   `${log.staff?.first_name || ''} ${log.staff?.last_name || ''}`.trim() : 
                   log.staff?.email || "Unknown"
      })) || [];
      
      setLogs(processedLogs);
    } catch (error: any) {
      console.error("Error fetching activity logs:", error);
      setError(error.message || "Failed to fetch activity logs");
      toast({
        title: "Error loading logs",
        description: "There was an issue loading the activity logs: " + (error.message || "Unknown error"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createLog = async (
    action_type: string, 
    description: string, 
    entity_type?: string, 
    entity_id?: string, 
    details?: any
  ) => {
    console.log("Creating activity log:", { action_type, description, entity_type, entity_id });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error("No authenticated user for logging");
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase.rpc("create_activity_log", {
        p_staff_id: session.user.id,
        p_action_type: action_type,
        p_description: description,
        p_entity_type: entity_type || null,
        p_entity_id: entity_id || null,
        p_details: details ? JSON.stringify(details) : null
      });

      if (error) {
        console.error("Error creating log:", error);
        throw error;
      }
      
      console.log("Log created:", data);
      
      // Refresh logs after creating a new one
      fetchLogs();
      
      toast({
        title: "Activity logged",
        description: "Your action has been recorded successfully.",
      });
      
      return data;
    } catch (error: any) {
      console.error("Error creating activity log:", error);
      toast({
        title: "Error logging activity",
        description: error.message || "Failed to log the activity",
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [limit]);

  return {
    logs,
    isLoading,
    error,
    fetchLogs,
    createLog
  };
};
