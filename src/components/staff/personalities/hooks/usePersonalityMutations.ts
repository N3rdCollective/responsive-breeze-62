
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Personality, PersonalityFormData } from "../types";

export const usePersonalityMutations = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const createPersonality = async (formData: PersonalityFormData): Promise<Personality | null> => {
    try {
      setIsSaving(true);
      
      // Transform form data to match database structure
      const personalityData = {
        name: formData.name,
        role: formData.role,
        bio: formData.bio || null,
        image_url: formData.image_url || null,
        social_links: {
          twitter: formData.socialLinks.twitter || "",
          instagram: formData.socialLinks.instagram || "",
          facebook: formData.socialLinks.facebook || ""
        },
        start_date: formData.startDate ? formData.startDate.toISOString() : null,
        display_order: formData.display_order || 999 // Default to end of list
      };
      
      const { data, error } = await supabase
        .from("personalities")
        .insert(personalityData)
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Personality created",
        description: `${formData.name} has been added successfully.`
      });
      
      if (data) {
        // Convert to our Personality type
        return {
          id: data.id,
          name: data.name,
          role: data.role,
          bio: data.bio,
          image_url: data.image_url,
          social_links: data.social_links as unknown as { twitter?: string, instagram?: string, facebook?: string } || null,
          created_at: data.created_at,
          updated_at: data.updated_at,
          start_date: data.start_date,
          display_order: data.display_order
        };
      }
      
      return null;
    } catch (error: any) {
      console.error("Error creating personality:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const updatePersonality = async (id: string, formData: PersonalityFormData): Promise<boolean> => {
    try {
      setIsSaving(true);
      
      // Transform form data to match database structure
      const personalityData = {
        name: formData.name,
        role: formData.role,
        bio: formData.bio || null,
        image_url: formData.image_url || null,
        social_links: {
          twitter: formData.socialLinks.twitter || "",
          instagram: formData.socialLinks.instagram || "",
          facebook: formData.socialLinks.facebook || ""
        },
        start_date: formData.startDate ? formData.startDate.toISOString() : null,
        display_order: formData.display_order
      };
      
      const { error } = await supabase
        .from("personalities")
        .update(personalityData)
        .eq("id", id);
        
      if (error) throw error;
      
      toast({
        title: "Personality updated",
        description: `${formData.name} has been updated successfully.`
      });
      
      return true;
    } catch (error: any) {
      console.error("Error updating personality:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deletePersonality = async (id: string): Promise<boolean> => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from("personalities")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast({
        title: "Personality deleted",
        description: "The personality has been deleted successfully."
      });
      
      return true;
    } catch (error: any) {
      console.error("Error deleting personality:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updatePersonalityOrder = async (personalities: Personality[]): Promise<boolean> => {
    try {
      setIsSaving(true);
      
      // Create a batch of updates with only the required fields
      const updates = personalities.map(personality => ({
        id: personality.id,
        name: personality.name,
        role: personality.role,
        display_order: personality.display_order
      }));
      
      // Use UPSERT with array of objects
      const { error } = await supabase
        .from("personalities")
        .upsert(updates);
        
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error("Error updating personality order:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    createPersonality,
    updatePersonality,
    deletePersonality,
    updatePersonalityOrder
  };
};
