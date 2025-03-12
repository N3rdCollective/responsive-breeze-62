
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import SponsorsList from "./components/SponsorsList";
import SponsorFormDialog from "./components/SponsorFormDialog";
import { useSponsorsData } from "./hooks/useSponsorsData";
import { useSponsorForm } from "./hooks/useSponsorForm";
import { Sponsor } from "./types";

const SponsorsManagement = () => {
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

  // Fixed handleReorder function to match the expected signature
  const handleReorder = async (id: string, direction: "up" | "down") => {
    if (!sponsors) return;
    
    // Find the current sponsor's index
    const currentIndex = sponsors.findIndex(s => s.id === id);
    if (currentIndex === -1) return;
    
    // Calculate the target index based on direction
    const targetIndex = direction === "up" 
      ? Math.max(0, currentIndex - 1)
      : Math.min(sponsors.length - 1, currentIndex + 1);
    
    // If we're already at the edge, do nothing
    if (currentIndex === targetIndex) return;
    
    try {
      // Get the target sponsor
      const targetSponsor = sponsors[targetIndex];
      
      // Swap display orders
      await updateSponsorMutation.mutateAsync({
        id,
        data: { display_order: targetSponsor.display_order }
      });
      
      await updateSponsorMutation.mutateAsync({
        id: targetSponsor.id,
        data: { display_order: sponsors[currentIndex].display_order }
      });
    } catch (error) {
      console.error("Error reordering sponsors:", error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sponsors & Affiliates</CardTitle>
        <Button 
          onClick={openAddDialog}
          className="ml-auto"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Sponsor
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <SponsorsList 
            sponsors={sponsors}
            isLoading={isLoading}
            onEdit={openEditDialog}
            onDelete={handleDeleteSponsor}
            onReorder={handleReorder}
            onToggleActive={handleToggleActive}
          />
        )}

        <SponsorFormDialog
          open={isAddDialogOpen}
          onOpenChange={closeAddDialog}
          title="Add Sponsor"
          description="Add a new sponsor or affiliate to your site."
          formData={formData}
          onInputChange={handleInputChange}
          onSwitchChange={handleSwitchChange}
          onFileChange={handleFileChange}
          onSubmit={handleAddSponsor}
          isSubmitting={isSubmitting || isUploading}
          buttonText="Add Sponsor"
        />

        <SponsorFormDialog
          open={isEditDialogOpen}
          onOpenChange={closeEditDialog}
          title="Edit Sponsor"
          description="Update sponsor information."
          formData={formData}
          onInputChange={handleInputChange}
          onSwitchChange={handleSwitchChange}
          onFileChange={handleFileChange}
          onSubmit={handleUpdateSponsor}
          isSubmitting={isSubmitting || isUploading}
          buttonText="Update Sponsor"
        />
      </CardContent>
    </Card>
  );
};

export default SponsorsManagement;
