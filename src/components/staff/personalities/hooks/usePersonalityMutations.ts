
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FormValues, Personality } from "../types";

export const usePersonalityMutations = (onSuccess: () => Promise<void>) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const updatePersonality = async (values: FormValues, selectedPersonalityId: string, imageUrl: string) => {
    try {
      setIsSaving(true);

      const { error } = await supabase
        .from("personalities")
        .update({
          name: values.name,
          role: values.role,
          bio: values.bio,
          image_url: imageUrl,
          show_times: {
            days: values.days.split(",").map(day => day.trim()),
            start: values.start,
            end: values.end
          },
          social_links: {
            twitter: values.twitter,
            instagram: values.instagram,
            facebook: values.facebook
          },
          updated_at: new Date().toISOString()
        })
        .eq("id", selectedPersonalityId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Personality updated successfully",
      });
      
      await onSuccess();
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

  const createPersonality = async (values: FormValues, imageUrl: string) => {
    try {
      setIsSaving(true);

      const { data, error } = await supabase
        .from("personalities")
        .insert({
          name: values.name,
          role: values.role,
          bio: values.bio,
          image_url: imageUrl,
          show_times: {
            days: values.days.split(",").map(day => day.trim()),
            start: values.start,
            end: values.end
          },
          social_links: {
            twitter: values.twitter,
            instagram: values.instagram,
            facebook: values.facebook
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: "New personality created successfully",
      });
      
      await onSuccess();
      
      if (data && data.length > 0) {
        // Convert the raw data to match our Personality type
        const newPersonality: Personality = {
          id: data[0].id,
          name: data[0].name,
          role: data[0].role,
          bio: data[0].bio,
          image_url: data[0].image_url,
          show_times: data[0].show_times as unknown as { days: string[], start: string, end: string } || null,
          social_links: data[0].social_links as unknown as { twitter?: string, instagram?: string, facebook?: string } || null,
          created_at: data[0].created_at,
          updated_at: data[0].updated_at,
          start_date: data[0].start_date
        };
        
        return newPersonality;
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
      setIsSaving(false);
    }
  };

  const deletePersonality = async (id: string) => {
    try {
      setIsSaving(true);

      const { error } = await supabase
        .from("personalities")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Personality deleted successfully",
      });
      
      await onSuccess();
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
    updatePersonality,
    createPersonality,
    deletePersonality
  };
};
