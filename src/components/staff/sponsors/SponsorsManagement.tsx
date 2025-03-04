
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useSponsorsData } from "./hooks/useSponsorsData";
import { useSponsorForm } from "./hooks/useSponsorForm";
import SponsorFormDialog from "./components/SponsorFormDialog";
import SponsorsList from "./components/SponsorsList";

const SponsorsManagement = () => {
  const {
    sponsors,
    isLoading,
    addSponsorMutation,
    updateSponsorMutation,
    deleteSponsorMutation,
    reorderSponsorsMutation,
    toggleActiveMutation
  } = useSponsorsData();

  const {
    formData,
    currentSponsor,
    isAddDialogOpen,
    isEditDialogOpen,
    handleInputChange,
    handleSwitchChange,
    validateForm,
    openAddDialog,
    openEditDialog,
    closeAddDialog,
    closeEditDialog,
    prepareFormDataForSubmit
  } = useSponsorForm(sponsors);

  const handleAddSponsor = () => {
    if (!validateForm()) return;
    const newSponsor = prepareFormDataForSubmit();
    addSponsorMutation.mutate(newSponsor, {
      onSuccess: () => closeAddDialog()
    });
  };

  const handleEditSponsor = () => {
    if (!validateForm() || !currentSponsor) return;
    
    const updatedSponsor = {
      name: formData.name.trim(),
      logo_url: formData.logo_url.trim() || null,
      website_url: formData.website_url.trim() || null,
      description: formData.description.trim() || null,
      is_active: formData.is_active,
    };

    updateSponsorMutation.mutate(
      { id: currentSponsor.id, data: updatedSponsor },
      { onSuccess: () => closeEditDialog() }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sponsors & Affiliates Management</h2>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add New Sponsor
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Sponsors & Affiliates</CardTitle>
        </CardHeader>
        <SponsorsList
          sponsors={sponsors}
          isLoading={isLoading}
          onEdit={openEditDialog}
          onDelete={(id) => deleteSponsorMutation.mutate(id)}
          onReorder={(id, direction) => reorderSponsorsMutation.mutate({ id, direction })}
          onToggleActive={(id, isActive) => toggleActiveMutation.mutate({ id, isActive })}
        />
      </Card>

      {/* Add Sponsor Dialog */}
      <SponsorFormDialog
        open={isAddDialogOpen}
        onOpenChange={closeAddDialog}
        title="Add New Sponsor"
        description="Enter the details for the new sponsor or affiliate."
        formData={formData}
        onInputChange={handleInputChange}
        onSwitchChange={handleSwitchChange}
        onSubmit={handleAddSponsor}
        isSubmitting={addSponsorMutation.isPending}
        buttonText="Add Sponsor"
      />

      {/* Edit Sponsor Dialog */}
      <SponsorFormDialog
        open={isEditDialogOpen}
        onOpenChange={closeEditDialog}
        title="Edit Sponsor"
        description="Update the details for this sponsor or affiliate."
        formData={formData}
        onInputChange={handleInputChange}
        onSwitchChange={handleSwitchChange}
        onSubmit={handleEditSponsor}
        isSubmitting={updateSponsorMutation.isPending}
        buttonText="Save Changes"
      />
    </div>
  );
};

export default SponsorsManagement;
