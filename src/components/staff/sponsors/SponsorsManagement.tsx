
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import SponsorsList from "./components/SponsorsList";
import SponsorDialogs from "./components/SponsorDialogs";
import SponsorsHeader from "./components/SponsorsHeader";
import { useSponsorOperations } from "./hooks/useSponsorOperations";

const SponsorsManagement = () => {
  const {
    sponsors,
    isLoading,
    isSubmitting,
    isUploading,
    formData,
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
  } = useSponsorOperations();

  return (
    <Card>
      <SponsorsHeader onAddClick={openAddDialog} />
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

        <SponsorDialogs
          isAddDialogOpen={isAddDialogOpen}
          isEditDialogOpen={isEditDialogOpen}
          formData={formData}
          isSubmitting={isSubmitting}
          isUploading={isUploading}
          onInputChange={handleInputChange}
          onSwitchChange={handleSwitchChange}
          onFileChange={handleFileChange}
          onAddSubmit={handleAddSponsor}
          onUpdateSubmit={handleUpdateSponsor}
          onAddDialogClose={closeAddDialog}
          onEditDialogClose={closeEditDialog}
        />
      </CardContent>
    </Card>
  );
};

export default SponsorsManagement;
