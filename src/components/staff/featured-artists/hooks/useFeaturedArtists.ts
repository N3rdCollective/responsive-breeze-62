
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FeaturedArtist } from "@/components/news/types/newsTypes";
import { useStaffActivityLogger } from "@/hooks/useStaffActivityLogger";

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

export const useFeaturedArtists = (showArchived: boolean = false) => {
  const [artists, setArtists] = useState<FeaturedArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const logger = useStaffActivityLogger();

  const fetchArtists = useCallback(async () => {
    try {
      console.log("Fetching artists, showArchived:", showArchived);
      setLoading(true);
      const query = supabase
        .from("featured_artists")
        .select("*")
        .order("created_at", { ascending: false });
      
      // Filter based on archived status
      if (!showArchived) {
        query.is("is_archived", false);
      } else {
        query.eq("is_archived", true);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching artists:", error);
        throw error;
      }
      
      console.log("Fetched artists:", data?.length || 0, "records");
      setArtists(data as FeaturedArtist[]);
    } catch (error: any) {
      console.error("Error in fetchArtists:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [showArchived, toast]);

  const createArtist = async (formData: FeaturedArtistFormData) => {
    try {
      setIsSaving(true);
      console.log("Creating artist with data:", formData);
      
      const { data, error } = await supabase
        .from("featured_artists")
        .insert([formData])
        .select()
        .single();
      
      if (error) {
        console.error("Error creating artist:", error);
        throw error;
      }
      
      console.log("Created artist:", data);
      
      // Log the action
      await logger.logActivity(
        "create_artist",
        `Created featured artist: ${data.name}`,
        "artist",
        data.id,
        { artistName: data.name }
      );
      
      toast({
        title: "Success",
        description: "Featured artist created successfully",
      });
      
      return data as FeaturedArtist;
    } catch (error: any) {
      console.error("Error in createArtist:", error);
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
      console.log("Updating artist:", id, "with data:", formData);
      
      const { data, error } = await supabase
        .from("featured_artists")
        .update(formData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating artist:", error);
        throw error;
      }
      
      console.log("Updated artist:", data);
      
      // Log the action
      await logger.logActivity(
        "update_artist",
        `Updated featured artist: ${data.name}`,
        "artist",
        id,
        { artistName: data.name }
      );
      
      toast({
        title: "Success",
        description: "Featured artist updated successfully",
      });
      
      return data as FeaturedArtist;
    } catch (error: any) {
      console.error("Error in updateArtist:", error);
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
      console.log("Deleting artist:", id);
      
      // Get the artist name before deletion for logging
      const { data: artistData } = await supabase
        .from("featured_artists")
        .select("name")
        .eq("id", id)
        .single();
      
      const { error } = await supabase
        .from("featured_artists")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Error deleting artist:", error);
        throw error;
      }
      
      console.log("Deleted artist:", id);
      
      // Log the action
      await logger.logActivity(
        "delete_artist",
        `Deleted featured artist: ${artistData?.name || "Unknown artist"}`,
        "artist",
        id,
        { artistName: artistData?.name || "Unknown artist" }
      );
      
      toast({
        title: "Success",
        description: "Featured artist deleted successfully",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error in deleteArtist:", error);
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

  const archiveArtist = async (id: string) => {
    try {
      setIsSaving(true);
      console.log("Archiving artist:", id);
      
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("featured_artists")
        .update({ 
          is_archived: true,
          archived_at: now
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.error("Error archiving artist:", error);
        throw error;
      }
      
      console.log("Archived artist:", data);
      
      // Log the action
      await logger.logActivity(
        "archive",
        `Archived featured artist: ${data.name}`,
        "artist",
        id,
        { artistName: data.name }
      );
      
      toast({
        title: "Success",
        description: "Artist archived successfully",
      });
      
      return data as FeaturedArtist;
    } catch (error: any) {
      console.error("Error in archiveArtist:", error);
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

  const restoreArtist = async (id: string) => {
    try {
      setIsSaving(true);
      console.log("Restoring artist:", id);
      
      const { data, error } = await supabase
        .from("featured_artists")
        .update({ 
          is_archived: false,
          archived_at: null
        })
        .eq("id", id)
        .select()
        .single();
      
      if (error) {
        console.error("Error restoring artist:", error);
        throw error;
      }
      
      console.log("Restored artist:", data);
      
      // Log the action
      await logger.logActivity(
        "restore",
        `Restored featured artist: ${data.name}`,
        "artist",
        id,
        { artistName: data.name }
      );
      
      toast({
        title: "Success",
        description: "Artist restored successfully",
      });
      
      return data as FeaturedArtist;
    } catch (error: any) {
      console.error("Error in restoreArtist:", error);
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

  return {
    artists,
    loading,
    isSaving,
    fetchArtists,
    createArtist,
    updateArtist,
    deleteArtist,
    archiveArtist,
    restoreArtist
  };
};
