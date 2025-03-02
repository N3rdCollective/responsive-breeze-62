
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { personalityFormSchema, PersonalityFormValues, parseSocialLinks } from "../schema/personalityFormSchema";

export const usePersonalityEditor = (personalityId: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form with default values
  const form = useForm<PersonalityFormValues>({
    resolver: zodResolver(personalityFormSchema),
    defaultValues: {
      name: "",
      role: "",
      bio: "",
      image_url: "",
      social_links: {
        twitter: "",
        instagram: "",
        facebook: ""
      },
      start_date: ""
    }
  });

  // Fetch personality data
  const { data: personality, isLoading, error } = useQuery({
    queryKey: ["personality", personalityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("personalities")
        .select("*")
        .eq("id", personalityId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!personalityId
  });

  // Update form values when personality data is loaded
  useEffect(() => {
    if (personality) {
      form.reset({
        name: personality.name || "",
        role: personality.role || "",
        bio: personality.bio || "",
        image_url: personality.image_url || "",
        social_links: parseSocialLinks(personality.social_links),
        start_date: personality.start_date || ""
      });
    }
  }, [personality, form]);

  const onSubmit = async (values: PersonalityFormValues) => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from("personalities")
        .update({
          name: values.name,
          role: values.role,
          bio: values.bio || null,
          image_url: values.image_url || null,
          social_links: values.social_links || null,
          start_date: values.start_date || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", personalityId);
      
      if (error) throw error;
      
      toast({
        title: "Personality updated",
        description: "The personality has been successfully updated.",
      });
      
      navigate("/staff/personalities");
    } catch (error) {
      console.error("Error updating personality:", error);
      toast({
        title: "Error updating personality",
        description: "There was an error updating the personality. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    personality,
    isLoading,
    error,
    isSubmitting,
    onSubmit
  };
};
