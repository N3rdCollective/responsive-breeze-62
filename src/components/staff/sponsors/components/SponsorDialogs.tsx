
import React from "react";
import SponsorFormDialog from "./SponsorFormDialog";
import { SponsorFormData } from "../types";

interface SponsorDialogsProps {
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  formData: SponsorFormData;
  isSubmitting: boolean;
  isUploading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSwitchChange: (checked: boolean) => void;
  onFileChange: (file: File | null) => void;
  onAddSubmit: () => void;
  onUpdateSubmit: () => void;
  onAddDialogClose: () => void;
  onEditDialogClose: () => void;
}

const SponsorDialogs: React.FC<SponsorDialogsProps> = ({
  isAddDialogOpen,
  isEditDialogOpen,
  formData,
  isSubmitting,
  isUploading,
  onInputChange,
  onSwitchChange,
  onFileChange,
  onAddSubmit,
  onUpdateSubmit,
  onAddDialogClose,
  onEditDialogClose
}) => {
  return (
    <>
      <SponsorFormDialog
        open={isAddDialogOpen}
        onOpenChange={onAddDialogClose}
        title="Add Sponsor"
        description="Add a new sponsor or affiliate to your site."
        formData={formData}
        onInputChange={onInputChange}
        onSwitchChange={onSwitchChange}
        onFileChange={onFileChange}
        onSubmit={onAddSubmit}
        isSubmitting={isSubmitting || isUploading}
        buttonText="Add Sponsor"
      />

      <SponsorFormDialog
        open={isEditDialogOpen}
        onOpenChange={onEditDialogClose}
        title="Edit Sponsor"
        description="Update sponsor information."
        formData={formData}
        onInputChange={onInputChange}
        onSwitchChange={onSwitchChange}
        onFileChange={onFileChange}
        onSubmit={onUpdateSubmit}
        isSubmitting={isSubmitting || isUploading}
        buttonText="Update Sponsor"
      />
    </>
  );
};

export default SponsorDialogs;
