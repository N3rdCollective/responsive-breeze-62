
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useImageUpload = () => {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelected = async (file: File) => {
    try {
      setIsUploading(true);
      
      // Skip preview creation - we'll just show the final image
      
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

  return {
    imageUrl,
    setImageUrl,
    handleImageSelected,
    isUploading
  };
};
