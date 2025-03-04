
import { useState } from "react";
import { FormValues, Personality, ShowTimes, SocialLinks } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

export const usePersonalityMutations = (
  refreshPersonalities: () => Promise<void>
) => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Transform Supabase data to match Personality type
  const transformData = (data: any): Personality => {
    return {
      id: data.id,
      name: data.name,
      role: data.role || "",
      bio: data.bio === "• -" ? null : data.bio || null,
      image_url: data.image_url || null,
      show_times: data.show_times as unknown as ShowTimes || null,
      social_links: data.social_links as unknown as SocialLinks || null,
      created_at: data.created_at,
      updated_at: data.updated_at,
      start_date: data.start_date
    };
  };

  // Create a new personality
  const createPersonality = async (values: FormValues, imageUrl: string): Promise<Personality | null> => {
    try {
      setIsSaving(true);
      
      // Create the social links object
      const socialLinks = {
        twitter: values.twitter || "",
        instagram: values.instagram || "",
        facebook: values.facebook || ""
      };
      
      // Set up the new personality data
      const newPersonality = {
        name: values.name,
        role: values.role,
        bio: values.bio && values.bio.trim() !== "" && values.bio !== "• -" ? values.bio : null,
        image_url: imageUrl || null,
        social_links: socialLinks
      };
      
      // Insert the new personality into the database
      const { data, error } = await supabase
        .from("personalities")
        .insert(newPersonality)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "New personality has been created.",
      });
      
      // Refresh the personalities list
      await refreshPersonalities();
      
      // Transform the data to match the Personality type
      return data ? transformData(data) : null;
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

  // Update an existing personality
  const updatePersonality = async (values: FormValues, id: string, imageUrl: string): Promise<void> => {
    try {
      setIsSaving(true);
      
      // Create the social links object
      const socialLinks = {
        twitter: values.twitter || "",
        instagram: values.instagram || "",
        facebook: values.facebook || ""
      };
      
      // Set up the personality update data
      const updatedPersonality = {
        name: values.name,
        role: values.role,
        bio: values.bio && values.bio.trim() !== "" && values.bio !== "• -" ? values.bio : null,
        image_url: imageUrl || null,
        social_links: socialLinks,
        updated_at: new Date().toISOString()
      };
      
      // Update the personality in the database
      const { error } = await supabase
        .from("personalities")
        .update(updatedPersonality)
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Personality has been updated.",
      });
      
      // Refresh the personalities list
      await refreshPersonalities();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a personality
  const deletePersonality = async (id: string): Promise<boolean> => {
    try {
      setIsSaving(true);
      
      // Delete the personality from the database
      const { error } = await supabase
        .from("personalities")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "Personality has been deleted.",
      });
      
      // Refresh the personalities list
      await refreshPersonalities();
      
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
    isSaving,
    createPersonality,
    updatePersonality,
    deletePersonality
  };
};
