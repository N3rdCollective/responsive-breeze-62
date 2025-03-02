
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Personality {
  id: string;
  name: string;
  role: string;
  image_url?: string | null;
  bio?: string | null;
  start_date?: string | null;
  social_links?: any | null;
}

interface SavePersonalityParams {
  id?: string | undefined;
  name: string;
  role: string;
  bio?: string | null;
  image_url?: string | null;
  start_date?: string | null;
}

export const usePersonalitiesData = () => {
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPersonalities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("personalities")
        .select("*")
        .order("name");
      
      if (error) {
        throw error;
      }
      
      setPersonalities(data || []);
    } catch (error) {
      console.error("Error fetching personalities:", error);
      toast({
        title: "Error",
        description: "Failed to load personalities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePersonality = async (personalityData: SavePersonalityParams) => {
    try {
      const { id, ...data } = personalityData;
      
      if (id) {
        // Update existing personality
        const { error } = await supabase
          .from("personalities")
          .update(data)
          .eq("id", id);
        
        if (error) throw error;
      } else {
        // Create new personality
        const { error } = await supabase
          .from("personalities")
          .insert([data]);
        
        if (error) throw error;
      }
      
      // Refresh the list
      await fetchPersonalities();
      return true;
    } catch (error) {
      console.error("Error saving personality:", error);
      throw error;
    }
  };

  const deletePersonality = async (id: string) => {
    try {
      const { error } = await supabase
        .from("personalities")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      // Refresh the list
      await fetchPersonalities();
      return true;
    } catch (error) {
      console.error("Error deleting personality:", error);
      throw error;
    }
  };

  // Load personalities on mount
  useEffect(() => {
    fetchPersonalities();
  }, []);

  return {
    personalities,
    loading,
    fetchPersonalities,
    savePersonality,
    deletePersonality
  };
};
