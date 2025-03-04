
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useImageUpload = () => {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState("");

  const handleImageSelected = async (file: File) => {
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from("personalities")
        .upload(fileName, file);

      if (error) throw error;

      if (data) {
        const { data: urlData } = await supabase.storage
          .from("personalities")
          .getPublicUrl(data.path);

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
    }
  };

  return {
    imageUrl,
    setImageUrl,
    handleImageSelected
  };
};
