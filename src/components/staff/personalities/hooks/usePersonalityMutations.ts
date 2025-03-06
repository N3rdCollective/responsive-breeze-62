
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PersonalityFormData, Personality, SocialLinks } from "../types";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

export const usePersonalityMutations = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createPersonality = async (formData: PersonalityFormData) => {
    try {
      setLoading(true);
      
      // Prepare the data for insertion
      const personalityData = {
        name: formData.name,
        role: formData.role,
        bio: formData.bio || null,
        image_url: formData.image_url || null,
        social_links: formData.socialLinks ? formData.socialLinks as unknown as Json : null,
        start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        featured: formData.featured || false
      };
      
      const { data, error } = await supabase
        .from("personalities")
        .insert(personalityData)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Personality created successfully",
      });
      
      return data as Personality;
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
  
  const updatePersonality = async (id: string, formData: PersonalityFormData) => {
    try {
      setLoading(true);
      
      // Prepare the data for update
      const personalityData = {
        name: formData.name,
        role: formData.role,
        bio: formData.bio || null,
        image_url: formData.image_url || null,
        social_links: formData.socialLinks ? formData.socialLinks as unknown as Json : null,
        start_date: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        featured: formData.featured
      };
      
      const { data, error } = await supabase
        .from("personalities")
        .update(personalityData)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Personality updated successfully",
      });
      
      return data as Personality;
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
  
  const deletePersonality = async (id: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("personalities")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Personality deleted successfully",
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
      setLoading(false);
    }
  };

  const updatePersonalityOrder = async (personalities: { id: string, display_order: number, name: string, role: string }[]) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("personalities")
        .upsert(personalities, { onConflict: 'id' });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Personality order updated successfully",
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
      setLoading(false);
    }
  };
  
  return {
    loading,
    isSaving: loading, // Add the isSaving property that usePersonalityEditor expects
    createPersonality,
    updatePersonality,
    deletePersonality,
    updatePersonalityOrder
  };
};
