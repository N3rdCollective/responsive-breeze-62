
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FormValues, Personality } from "../types";
import { useForm } from "react-hook-form";
import { useFetchPersonalities } from "./useFetchPersonalities";
import { useImageUpload } from "./useImageUpload";
import { usePersonalityMutations } from "./usePersonalityMutations";
import { useStaffActivityLogger } from "@/hooks/useStaffActivityLogger";

const defaultFormValues: FormValues = {
  id: "",
  name: "",
  role: "",
  bio: "",
  image_url: "",
  twitter: "",
  instagram: "",
  facebook: "",
  featured: false
};

export const usePersonalityEditor = (canEdit: boolean) => {
  const navigate = useNavigate();
  const [selectedPersonality, setSelectedPersonality] = useState<Personality | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [featured, setFeatured] = useState(false);
  const { logActivity } = useStaffActivityLogger();

  // Use the smaller hooks
  const { personalities, loading, fetchPersonalities, fetchPersonalityById } = useFetchPersonalities();
  const { imageUrl, setImageUrl, handleImageSelected, isUploading } = useImageUpload();
  const { isSaving, createPersonality, updatePersonality, deletePersonality } = usePersonalityMutations();

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
      setFeatured(personalityData.featured || false);
      
      // Update form values
      form.setValue("id", personalityData.id);
      form.setValue("name", personalityData.name || "");
      form.setValue("role", personalityData.role || "");
      form.setValue("bio", personalityData.bio || "");
      form.setValue("image_url", personalityData.image_url || "");
      form.setValue("featured", personalityData.featured || false);
      
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
      featured: values.featured
    };
    
    const updated = await updatePersonality(selectedPersonality.id, formData);
    if (updated) {
      // Log personality update
      await logActivity(
        "update_personality",
        `Updated personality: ${values.name}`,
        "personality",
        selectedPersonality.id,
        {
          name: values.name,
          role: values.role,
          hasImage: !!imageUrl
        }
      );
      
      await fetchPersonalities(); // Refresh the list
    }
  };

  const handleCreateNew = () => {
    setSelectedPersonality(null);
    setName("");
    setRole("");
    setBio("");
    setImageUrl("");
    setStartDate(null);
    setFeatured(false);
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
      featured: values.featured
    };
    
    const newPersonality = await createPersonality(formData);
    if (newPersonality) {
      // Log personality creation
      await logActivity(
        "create_personality",
        `Created new personality: ${values.name}`,
        "personality",
        newPersonality.id,
        {
          name: values.name,
          role: values.role,
          hasImage: !!imageUrl
        }
      );
      
      await fetchPersonalities(); // Refresh the list
      setSelectedPersonality(newPersonality);
    }
  };

  const handleDelete = async (id: string) => {
    if (!selectedPersonality || !window.confirm("Are you sure you want to delete this personality?")) {
      return;
    }
    
    const success = await deletePersonality(id);
    if (success) {
      // Log personality deletion
      await logActivity(
        "delete_personality",
        `Deleted personality: ${selectedPersonality.name}`,
        "personality",
        id,
        {
          name: selectedPersonality.name,
          role: selectedPersonality.role
        }
      );
      
      await fetchPersonalities(); // Refresh the list
      setSelectedPersonality(null);
      form.reset(defaultFormValues);
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
    featured,
    setFeatured,
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
    handleDelete
  };
};
