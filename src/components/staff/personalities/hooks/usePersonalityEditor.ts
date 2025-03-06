
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FormValues, Personality } from "../types";
import { useForm } from "react-hook-form";
import { useFetchPersonalities } from "./useFetchPersonalities";
import { useImageUpload } from "./useImageUpload";
import { usePersonalityMutations } from "./usePersonalityMutations";
import { useToast } from "@/hooks/use-toast";

const defaultFormValues: FormValues = {
  id: "",
  name: "",
  role: "",
  bio: "",
  image_url: "",
  twitter: "",
  instagram: "",
  facebook: ""
};

export const usePersonalityEditor = (canEdit: boolean) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPersonality, setSelectedPersonality] = useState<Personality | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);

  // Use the smaller hooks
  const { personalities, loading, fetchPersonalities, fetchPersonalityById } = useFetchPersonalities();
  const { imageUrl, setImageUrl, handleImageSelected, isUploading } = useImageUpload();
  const { isSaving, createPersonality, updatePersonality, deletePersonality, updatePersonalityOrder } = usePersonalityMutations();

  const form = useForm<FormValues>({
    defaultValues: defaultFormValues
  });

  useEffect(() => {
    if (canEdit) {
      fetchPersonalities();
    }
  }, [canEdit]);

  const handleSelectPersonality = async (personality: Personality) => {
    setSelectedPersonality(personality);
    
    const personalityData = await fetchPersonalityById(personality.id);
    if (personalityData) {
      // Update state with fetched data
      setName(personalityData.name || "");
      setRole(personalityData.role || "");
      setBio(personalityData.bio || "");
      setImageUrl(personalityData.image_url || "");
      setStartDate(personalityData.start_date ? new Date(personalityData.start_date) : null);
      
      // Update form values
      form.setValue("id", personalityData.id);
      form.setValue("name", personalityData.name || "");
      form.setValue("role", personalityData.role || "");
      form.setValue("bio", personalityData.bio || "");
      form.setValue("image_url", personalityData.image_url || "");
      
      // Type conversion for social_links
      if (personalityData.social_links) {
        const socialLinksData = personalityData.social_links;
        
        // Update form values for social links
        form.setValue("twitter", socialLinksData.twitter || "");
        form.setValue("instagram", socialLinksData.instagram || "");
        form.setValue("facebook", socialLinksData.facebook || "");
      } else {
        form.setValue("twitter", "");
        form.setValue("instagram", "");
        form.setValue("facebook", "");
      }
    }
  };

  const handleSubmit = async (values: FormValues) => {
    if (!selectedPersonality) return;
    
    // Create PersonalityFormData object from form values
    const formData = {
      name: values.name,
      role: values.role,
      bio: values.bio,
      image_url: imageUrl,
      socialLinks: {
        twitter: values.twitter,
        instagram: values.instagram,
        facebook: values.facebook
      },
      startDate: startDate,
      display_order: selectedPersonality.display_order
    };
    
    await updatePersonality(selectedPersonality.id, formData);
  };

  const handleCreateNew = () => {
    setSelectedPersonality(null);
    setName("");
    setRole("");
    setBio("");
    setImageUrl("");
    setStartDate(null);
    form.reset(defaultFormValues);
  };

  const handleSaveNew = async (values: FormValues) => {
    // Create PersonalityFormData object from form values
    const formData = {
      name: values.name,
      role: values.role,
      bio: values.bio,
      image_url: imageUrl,
      socialLinks: {
        twitter: values.twitter,
        instagram: values.instagram,
        facebook: values.facebook
      },
      startDate: startDate,
      // Set display_order to be at the end of the list
      display_order: personalities.length > 0 
        ? Math.max(...personalities.map(p => p.display_order || 0)) + 1 
        : 1
    };
    
    const newPersonality = await createPersonality(formData);
    if (newPersonality) {
      setSelectedPersonality(newPersonality);
    }
  };

  const handleDelete = async (id: string) => {
    if (!selectedPersonality || !window.confirm("Are you sure you want to delete this personality?")) {
      return;
    }
    
    const success = await deletePersonality(id);
    if (success) {
      setSelectedPersonality(null);
    }
  };

  const handleReorderPersonalities = async (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;

    const reorderedPersonalities = [...personalities];
    const [removed] = reorderedPersonalities.splice(sourceIndex, 1);
    reorderedPersonalities.splice(destinationIndex, 0, removed);

    // Update display order for all affected personalities
    const updatedPersonalities = reorderedPersonalities.map((personality, index) => ({
      ...personality,
      display_order: index + 1
    }));

    // Update the state immediately for a responsive UI
    try {
      // Call the API to update the order in the database
      await updatePersonalityOrder(updatedPersonalities);
      
      // Refetch personalities to get the updated order
      await fetchPersonalities();
      
      toast({
        title: "Order updated",
        description: "The personality order has been successfully updated",
      });
    } catch (error) {
      console.error("Error updating personality order:", error);
      toast({
        title: "Error updating order",
        description: "There was an error updating the personality order",
        variant: "destructive"
      });
      
      // Refetch personalities to restore original order
      await fetchPersonalities();
    }
  };

  return {
    name,
    setName, 
    role, 
    setRole,
    bio, 
    setBio,
    imageUrl, 
    setImageUrl,
    startDate, 
    setStartDate,
    form,
    personalities,
    loading,
    selectedPersonality,
    isSaving,
    isUploading,
    handleSelectPersonality,
    handleImageSelected,
    handleSubmit,
    handleCreateNew,
    handleSaveNew,
    handleDelete,
    handleReorderPersonalities
  };
};
