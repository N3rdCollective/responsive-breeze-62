import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useImageUpload = () => {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelected = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Create a local preview URL for immediate display
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);
      
      // Upload the file to Supabase storage
      const fileName = `${Date.now()}-${file.name.replace(/[^\x00-\x7F]/g, '')}`;
      const { data, error } = await supabase.storage
        .from("personalities")
        .upload(fileName, file);

      if (error) throw error;

      if (data) {
        // Get the permanent public URL after successful upload
        const { data: urlData } = await supabase.storage
          .from("personalities")
          .getPublicUrl(data.path);

        // Store the permanent URL
        setImageUrl(urlData.publicUrl);
        
        // Keep the preview URL for display during this session
        // but return the permanent URL for database storage
        return urlData.publicUrl;
      }
      return "";
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return "";
    } finally {
      setIsUploading(false);
    }
  };

  // Function to get the current display URL (either preview or permanent)
  const getDisplayUrl = () => {
    return previewUrl || imageUrl;
  };

  // Cleanup function to revoke any blob URLs before component unmounts
  const cleanup = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return {
    imageUrl,
    setImageUrl,
    previewUrl,
    setPreviewUrl,
    getDisplayUrl,
    handleImageSelected,
    isUploading,
    cleanup
  };
};
