
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FeaturedArtist } from "@/components/news/types/newsTypes";

export interface FeaturedArtistFormData {
  name: string;
  bio: string;
  image_url: string;
  website?: string | null;
  social_links?: {
    spotify?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  } | null;
}

export const useFeaturedArtists = () => {
  const [artists, setArtists] = useState<FeaturedArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("featured_artists")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setArtists(data as FeaturedArtist[]);
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

  const createArtist = async (formData: FeaturedArtistFormData) => {
    try {
      setIsSaving(true);
      
      const { data, error } = await supabase
        .from("featured_artists")
        .insert([formData])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Featured artist created successfully",
      });
      
      return data as FeaturedArtist;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };
  
  const updateArtist = async (id: string, formData: FeaturedArtistFormData) => {
    try {
      setIsSaving(true);
      
      const { data, error } = await supabase
        .from("featured_artists")
        .update(formData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Featured artist updated successfully",
      });
      
      return data as FeaturedArtist;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };
  
  const deleteArtist = async (id: string) => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from("featured_artists")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Featured artist deleted successfully",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    artists,
    loading,
    isSaving,
    fetchArtists,
    createArtist,
    updateArtist,
    deleteArtist
  };
};
