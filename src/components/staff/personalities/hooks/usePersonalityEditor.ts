
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Personality, FormValues } from "../types";
import { handleImageUpload } from "@/components/news/editor/ImageUploader";
import { preparePersonalityFormData, prepareUpdateData } from "../utils/personalityUtils";

export const usePersonalityEditor = (canEdit: boolean) => {
  const { toast } = useToast();
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
  const form = useForm<FormValues>({
    defaultValues: {
      id: "",
      name: "",
      role: "",
      bio: "",
      image_url: "",
      twitter: "",
      instagram: "",
      facebook: "",
      days: "",
      start: "",
      end: "",
    }
  });

  const fetchPersonalities = async () => {
    try {
      setLoading(true);
      console.log("Fetching personalities from database...");
      
      const { data, error } = await supabase
        .from("personalities")
        .select("*")
        .order("name");
      
      if (error) {
        console.error("Error fetching personalities:", error);
        throw error;
      }
      
      console.log("Fetched personalities:", data);
      
      if (data) {
        // Convert database data to the expected Personality type
        const typedPersonalities: Personality[] = data.map(item => {
          return {
            ...item,
            show_times: item.show_times as unknown as ShowTimes,
            social_links: item.social_links as unknown as SocialLinks
          };
        });
        
        setPersonalities(typedPersonalities);
        console.log("Personalities set in state:", typedPersonalities);
      }
    } catch (error) {
      console.error("Error fetching personalities:", error);
      toast({
        title: "Error",
        description: "Failed to load personalities. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalities();
  }, []);

  const handleSelectPersonality = (id: string) => {
    console.log("Selecting personality with ID:", id);
    const personality = personalities.find(p => p.id === id);
    if (!personality) {
      console.error("Personality not found with ID:", id);
      return;
    }
    
    console.log("Found personality:", personality);
    setSelectedPersonality(id);
    setSelectedImage(null);
    
    // Reset form with personality data
    form.reset(preparePersonalityFormData(personality));
    
    console.log("Form reset with personality data");
  };

  const handleImageSelected = (file: File) => {
    setSelectedImage(file);
  };

  const handleSubmit = async (values: FormValues) => {
    if (!canEdit) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit personalities.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      console.log("Starting personality update process for ID:", values.id);
      console.log("Form values:", values);
      
      // Process image upload if there's a new image
      let imageUrl = values.image_url;
      if (selectedImage) {
        console.log("Uploading new image...");
        const uploadedImageUrl = await handleImageUpload(selectedImage);
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
          console.log("New image uploaded:", imageUrl);
        } else {
          throw new Error("Failed to upload image");
        }
      }
      
      const updateData = prepareUpdateData(values, imageUrl);
      
      console.log("Updating personality with ID:", values.id);
      console.log("Update data:", updateData);
      
      // Make sure the id is valid before proceeding
      if (!values.id) {
        throw new Error("Invalid personality ID");
      }
      
      // Debug: Test direct query to verify the row exists
      const { data: existingData, error: existingError } = await supabase
        .from("personalities")
        .select("id, name")
        .eq("id", values.id)
        .single();
        
      if (existingError) {
        console.error("Error verifying personality exists:", existingError);
        throw new Error(`Record with ID ${values.id} not found in database`);
      }
      
      console.log("Found existing personality for update:", existingData);
      
      // Add delay to avoid potential timing issues
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data, error } = await supabase
        .from("personalities")
        .update(updateData)
        .eq("id", values.id)
        .select();
      
      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }
      
      console.log("Update response data:", data);
      
      if (!data || data.length === 0) {
        console.warn("Update succeeded but no data returned");
      }
      
      toast({
        title: "Success",
        description: `${values.name} has been updated successfully.`
      });
      
      // Refresh the personalities list
      await fetchPersonalities();
      
      // Re-select the updated personality to reflect changes in the UI
      if (values.id) {
        // Use longer timeout to ensure data is refreshed
        setTimeout(() => {
          handleSelectPersonality(values.id);
        }, 1000); // Increased timeout for reliable refresh
      }
      
    } catch (error) {
      console.error("Error updating personality:", error);
      toast({
        title: "Error",
        description: "Failed to update personality. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNew = () => {
    // Reset form for new personality
    form.reset({
      id: "",
      name: "",
      role: "Host",
      bio: "",
      image_url: "",
      twitter: "",
      instagram: "",
      facebook: "",
      days: "",
      start: "",
      end: "",
    });
    setSelectedPersonality(null);
    setSelectedImage(null);
  };

  const handleSaveNew = async (values: FormValues) => {
    if (!canEdit) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to create personalities.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Process image upload if there's a new image
      let imageUrl = values.image_url;
      if (selectedImage) {
        const uploadedImageUrl = await handleImageUpload(selectedImage);
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl;
        } else {
          throw new Error("Failed to upload image");
        }
      }
      
      const newPersonalityData = prepareUpdateData(values, imageUrl);
      
      console.log("Creating new personality:", newPersonalityData);
      
      const { data, error } = await supabase
        .from("personalities")
        .insert(newPersonalityData)
        .select();
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: `${values.name} has been created successfully.`
      });
      
      // Refresh the personalities list
      await fetchPersonalities();
      
      // Select the newly created personality
      if (data && data.length > 0) {
        handleSelectPersonality(data[0].id);
      }
      
    } catch (error) {
      console.error("Error creating personality:", error);
      toast({
        title: "Error",
        description: "Failed to create personality. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete personalities.",
        variant: "destructive"
      });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this personality? This action cannot be undone.")) {
      return;
    }

    try {
      setIsSaving(true);
      
      console.log("Deleting personality with ID:", id);
      
      const { error } = await supabase
        .from("personalities")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Personality has been deleted successfully."
      });
      
      // Refresh the personalities list
      await fetchPersonalities();
      handleCreateNew();
      
    } catch (error) {
      console.error("Error deleting personality:", error);
      toast({
        title: "Error",
        description: "Failed to delete personality. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    form,
    personalities,
    loading,
    selectedPersonality,
    isSaving,
    handleSelectPersonality,
    handleImageSelected,
    handleSubmit,
    handleCreateNew,
    handleSaveNew,
    handleDelete
  };
};

export default usePersonalityEditor;
