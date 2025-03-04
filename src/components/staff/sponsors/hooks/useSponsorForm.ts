
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Sponsor, SponsorFormData } from "../types";

const defaultFormValues: SponsorFormData = {
  name: "",
  logo_url: "",
  website_url: "",
  description: "",
  is_active: true
};

export const useSponsorForm = (sponsors?: Sponsor[]) => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSponsor, setCurrentSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState<SponsorFormData>(defaultFormValues);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Sponsor name is required.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData(defaultFormValues);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (sponsor: Sponsor) => {
    setCurrentSponsor(sponsor);
    setFormData({
      name: sponsor.name,
      logo_url: sponsor.logo_url || "",
      website_url: sponsor.website_url || "",
      description: sponsor.description || "",
      is_active: sponsor.is_active,
    });
    setIsEditDialogOpen(true);
  };

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
    resetForm();
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setCurrentSponsor(null);
  };

  const prepareFormDataForSubmit = (): Omit<SponsorFormData & { display_order?: number }, "id"> => {
    return {
      name: formData.name.trim(),
      logo_url: formData.logo_url.trim() || null,
      website_url: formData.website_url.trim() || null,
      description: formData.description.trim() || null,
      is_active: formData.is_active,
      display_order: sponsors ? sponsors.length : 0,
    };
  };

  return {
    formData,
    currentSponsor,
    isAddDialogOpen,
    isEditDialogOpen,
    handleInputChange,
    handleSwitchChange,
    validateForm,
    resetForm,
    openAddDialog,
    openEditDialog,
    closeAddDialog,
    closeEditDialog,
    prepareFormDataForSubmit
  };
};
