
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Personality } from "../types";
import { Json } from "@/integrations/supabase/types";

export const useFetchPersonalities = () => {
  const { toast } = useToast();
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPersonalities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("personalities")
        .select("*")
        .order("name");

      if (error) throw error;

      if (data) {
        // Convert the raw data to match our Personality type
        const typedPersonalities: Personality[] = data.map(p => ({
          id: p.id,
          name: p.name,
          role: p.role,
          bio: p.bio,
          image_url: p.image_url,
          show_times: p.show_times as unknown as { days: string[], start: string, end: string } || null,
          social_links: p.social_links as unknown as { twitter?: string, instagram?: string, facebook?: string } || null,
          created_at: p.created_at,
          updated_at: p.updated_at,
          start_date: p.start_date
        }));
        
        setPersonalities(typedPersonalities);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalityById = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("personalities")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        // Convert the raw data to match our Personality type
        const personalityData: Personality = {
          id: data.id,
          name: data.name || "",
          role: data.role || "",
          bio: data.bio || null,
          image_url: data.image_url || null,
          show_times: data.show_times as unknown as { days: string[], start: string, end: string } || null,
          social_links: data.social_links as unknown as { twitter?: string, instagram?: string, facebook?: string } || null,
          created_at: data.created_at,
          updated_at: data.updated_at,
          start_date: data.start_date
        };
        
        return personalityData;
      }
      return null;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    personalities,
    loading,
    fetchPersonalities,
    fetchPersonalityById
  };
};
