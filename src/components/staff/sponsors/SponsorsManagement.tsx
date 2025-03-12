
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import SponsorsList from "./components/SponsorsList";
import SponsorFormDialog from "./components/SponsorFormDialog";
import { useSponsorsData } from "./hooks/useSponsorsData";
import { useSponsorForm } from "./hooks/useSponsorForm";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sponsor } from "./types";

const SponsorsManagement = () => {
  const { toast } = useToast();
  const { sponsors, loading, fetchSponsors } = useSponsorsData();
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
      
      const { error } = await supabase
        .from("sponsors_affiliates")
        .insert([preparedData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sponsor added successfully!",
      });
      
      closeAddDialog();
      fetchSponsors();
    } catch (error) {
      console.error("Error adding sponsor:", error);
      toast({
        title: "Error",
        description: "Failed to add sponsor. Please try again.",
        variant: "destructive",
      });
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
      
      const { error } = await supabase
        .from("sponsors_affiliates")
        .update(preparedData)
        .eq("id", currentSponsor.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sponsor updated successfully!",
      });
      
      closeEditDialog();
      fetchSponsors();
    } catch (error) {
      console.error("Error updating sponsor:", error);
      toast({
        title: "Error",
        description: "Failed to update sponsor. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSponsor = async (sponsor: Sponsor) => {
    if (!window.confirm(`Are you sure you want to delete ${sponsor.name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("sponsors_affiliates")
        .delete()
        .eq("id", sponsor.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sponsor deleted successfully!",
      });
      
      fetchSponsors();
    } catch (error) {
      console.error("Error deleting sponsor:", error);
      toast({
        title: "Error",
        description: "Failed to delete sponsor. Please try again.",
        variant: "destructive",
      });
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
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <SponsorsList 
            sponsors={sponsors}
            onEdit={openEditDialog}
            onDelete={handleDeleteSponsor}
          />
        )}

        <SponsorFormDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
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
          onOpenChange={setIsEditDialogOpen}
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
