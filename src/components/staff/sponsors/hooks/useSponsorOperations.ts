
import { useState } from "react";
import { useSponsorsData } from "./useSponsorsData";
import { useSponsorForm } from "./useSponsorForm";
import { Sponsor } from "../types";

export const useSponsorOperations = () => {
  const { sponsors, isLoading, addSponsorMutation, updateSponsorMutation, deleteSponsorMutation } = useSponsorsData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    formData,
    currentSponsor,
    isAddDialogOpen,
    isEditDialogOpen,
    isUploading,
    handleInputChange,
    handleSwitchChange,
    handleFileChange,
    validateForm,
    openAddDialog,
    openEditDialog,
    closeAddDialog,
    closeEditDialog,
    prepareFormDataForSubmit
  } = useSponsorForm(sponsors);

  const handleAddSponsor = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const preparedData = await prepareFormDataForSubmit();
      if (!preparedData) {
        setIsSubmitting(false);
        return;
      }
      
      await addSponsorMutation.mutateAsync(preparedData);
      closeAddDialog();
    } catch (error) {
      console.error("Error adding sponsor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSponsor = async () => {
    if (!currentSponsor || !validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const preparedData = await prepareFormDataForSubmit();
      if (!preparedData) {
        setIsSubmitting(false);
        return;
      }
      
      await updateSponsorMutation.mutateAsync({
        id: currentSponsor.id,
        data: preparedData
      });
      closeEditDialog();
    } catch (error) {
      console.error("Error updating sponsor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSponsor = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this sponsor?`)) {
      return;
    }

    try {
      await deleteSponsorMutation.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting sponsor:", error);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateSponsorMutation.mutateAsync({
        id,
        data: { is_active: isActive }
      });
    } catch (error) {
      console.error("Error toggling sponsor active status:", error);
    }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    if (!sponsors) return;
    
    const currentIndex = sponsors.findIndex(s => s.id === id);
    if (currentIndex === -1) return;
    
    const targetIndex = direction === "up" 
      ? Math.max(0, currentIndex - 1)
      : Math.min(sponsors.length - 1, currentIndex + 1);
    
    if (currentIndex === targetIndex) return;
    
    try {
      const targetSponsor = sponsors[targetIndex];
      
      await updateSponsorMutation.mutateAsync({
        id,
        data: { 
          name: sponsors[currentIndex].name,
          logo_url: sponsors[currentIndex].logo_url || "",
          website_url: sponsors[currentIndex].website_url || "",
          description: sponsors[currentIndex].description || "",
          is_active: sponsors[currentIndex].is_active,
          display_order: targetSponsor.display_order
        }
      });
      
      await updateSponsorMutation.mutateAsync({
        id: targetSponsor.id,
        data: {
          name: targetSponsor.name,
          logo_url: targetSponsor.logo_url || "",
          website_url: targetSponsor.website_url || "",
          description: targetSponsor.description || "",
          is_active: targetSponsor.is_active,
          display_order: sponsors[currentIndex].display_order
        }
      });
    } catch (error) {
      console.error("Error reordering sponsors:", error);
    }
  };

  return {
    sponsors,
    isLoading,
    isSubmitting,
    isUploading,
    formData,
    currentSponsor,
    isAddDialogOpen,
    isEditDialogOpen,
    handleInputChange,
    handleSwitchChange,
    handleFileChange,
    handleAddSponsor,
    handleUpdateSponsor,
    handleDeleteSponsor,
    handleToggleActive,
    handleReorder,
    openAddDialog,
    openEditDialog,
    closeAddDialog,
    closeEditDialog
  };
};
