
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { personalityFormSchema, PersonalityFormValues, parseSocialLinks } from "../schema/personalityFormSchema";
import { handleImageUpload } from "@/components/news/editor/ImageUploader";

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
      }
    }
  });

  // Fetch personality data
  const { data: personality, isLoading, error } = useQuery({
    queryKey: ["personality", personalityId],
    queryFn: async () => {
      if (!personalityId) {
        throw new Error("No personality ID provided");
      }
      
      console.log("Fetching personality data for ID:", personalityId);
      const { data, error } = await supabase
        .from("personalities")
        .select("*")
        .eq("id", personalityId)
        .single();
      
      if (error) {
        console.error("Error fetching personality:", error);
        throw error;
      }
      
      console.log("Fetched personality data:", data);
      return data;
    },
    enabled: !!personalityId
  });

  // Update form values when personality data is loaded
  useEffect(() => {
    if (personality) {
      console.log("Setting form values with personality data:", personality);
      form.reset({
        name: personality.name || "",
        role: personality.role || "",
        bio: personality.bio || "",
        image_url: personality.image_url || "",
        social_links: parseSocialLinks(personality.social_links)
      });
    }
  }, [personality, form]);

  const onSubmit = async (values: PersonalityFormValues) => {
    if (!personalityId) {
      toast({
        title: "Error updating personality",
        description: "No personality ID provided.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Handle image upload if a new image was provided
      let imageUrl = values.image_url || null;
      if (values.image_file) {
        console.log("Uploading new image file:", values.image_file.name);
        const uploadedUrl = await handleImageUpload(values.image_file);
        if (uploadedUrl) {
          console.log("Image uploaded successfully:", uploadedUrl);
          imageUrl = uploadedUrl;
        } else {
          console.error("Failed to upload image");
        }
      }
      
      // Log the update operation to debug
      console.log("Updating personality with ID:", personalityId);
      console.log("Update data:", {
        name: values.name,
        role: values.role,
        bio: values.bio || null,
        image_url: imageUrl,
        social_links: values.social_links || null
      });
      
      const { error: updateError, data: updatedData } = await supabase
        .from("personalities")
        .update({
          name: values.name,
          role: values.role,
          bio: values.bio || null,
          image_url: imageUrl,
          social_links: values.social_links || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", personalityId)
        .select();
      
      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw updateError;
      }
      
      console.log("Update successful, response:", updatedData);
      
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
