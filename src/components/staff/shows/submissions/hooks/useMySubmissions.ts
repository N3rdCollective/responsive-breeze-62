import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShowSubmission } from "../../types";

export const useMySubmissions = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['my-submissions', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('show_submissions')
        .select('*')
        .eq('submitted_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShowSubmission[];
    },
    enabled: !!userId
  });
};
