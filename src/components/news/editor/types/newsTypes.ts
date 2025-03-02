
import { Database } from "@/integrations/supabase/types";

/**
 * Type for posts table from Supabase
 */
export type Post = Database['public']['Tables']['posts']['Row'];
