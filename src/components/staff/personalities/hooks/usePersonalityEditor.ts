
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FormValues, Personality } from "../types";
import { useForm } from "react-hook-form";
import { useFetchPersonalities } from "./useFetchPersonalities";
import { useImageUpload } from "./useImageUpload";
import { usePersonalityMutations } from "./usePersonalityMutations";

const defaultFormValues: FormValues = {
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
  end: ""
};

export const usePersonalityEditor = (canEdit: boolean) => {
  const navigate = useNavigate();
  const [selectedPersonality, setSelectedPersonality] = useState<Personality | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);

  // Use the smaller hooks
  const { personalities, loading, fetchPersonalities, fetchPersonalityById } = useFetchPersonalities();
  const { imageUrl, setImageUrl, handleImageSelected } = useImageUpload();
  const { isSaving, updatePersonality, createPersonality, deletePersonality } = usePersonalityMutations(fetchPersonalities);

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
      
      // Type conversion for show_times
      if (personalityData.show_times) {
        const showTimesData = personalityData.show_times;
        
        // Update form values for show times
        form.setValue("days", showTimesData.days.join(", "));
        form.setValue("start", showTimesData.start);
        form.setValue("end", showTimesData.end);
      } else {
        form.setValue("days", "");
        form.setValue("start", "");
        form.setValue("end", "");
      }
      
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
    await updatePersonality(values, selectedPersonality.id, imageUrl);
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
    const newPersonality = await createPersonality(values, imageUrl);
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
    handleSelectPersonality,
    handleImageSelected,
    handleSubmit,
    handleCreateNew,
    handleSaveNew,
    handleDelete
  };
};
