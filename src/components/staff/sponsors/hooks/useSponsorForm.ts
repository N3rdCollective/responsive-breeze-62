import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Sponsor, SponsorFormData } from "../types";
import { supabase } from "@/integrations/supabase/client";

const defaultFormValues: SponsorFormData = {
  name: "",
  logo_url: "",
  website_url: "",
  description: "",
  is_active: true,
  logo_file: null
};

export const useSponsorForm = (sponsors?: Sponsor[]) => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSponsor, setCurrentSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState<SponsorFormData>(defaultFormValues);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, is_active: checked }));
  };

  const handleFileChange = (file: File | null) => {
    setFormData(prev => ({ ...prev, logo_file: file }));
    if (file) {
      setFormData(prev => ({ ...prev, logo_url: "" }));
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `sponsors/${fileName}`;

      const { error: uploadError, data } = await supabase
        .storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('public')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: `Failed to upload logo: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
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

  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
    resetForm();
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setCurrentSponsor(null);
    resetForm();
  };

  const prepareFormDataForSubmit = async (): Promise<Omit<SponsorFormData & { display_order?: number }, "id" | "logo_file"> | null> => {
    let logoUrl = formData.logo_url.trim();
    
    if (formData.logo_file) {
      const uploadedUrl = await uploadLogo(formData.logo_file);
      if (uploadedUrl) {
        logoUrl = uploadedUrl;
      } else {
        return null;
      }
    }
    
    return {
      name: formData.name.trim(),
      logo_url: logoUrl || null,
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
    isUploading,
    handleInputChange,
    handleSwitchChange,
    handleFileChange,
    validateForm,
    resetForm,
    openAddDialog: () => {
      resetForm();
      setIsAddDialogOpen(true);
    },
    openEditDialog: (sponsor: Sponsor) => {
      setCurrentSponsor(sponsor);
      setFormData({
        name: sponsor.name,
        logo_url: sponsor.logo_url || "",
        website_url: sponsor.website_url || "",
        description: sponsor.description || "",
        is_active: sponsor.is_active,
        logo_file: null
      });
      setIsEditDialogOpen(true);
    },
    closeAddDialog,
    closeEditDialog,
    prepareFormDataForSubmit
  };
};
