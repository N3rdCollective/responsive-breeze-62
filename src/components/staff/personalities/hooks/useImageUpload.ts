
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
      
      console.log("Starting image upload to personalities bucket:", file.name);
      
      // Upload the file to Supabase storage
      const fileName = `${Date.now()}-${file.name.replace(/[^\x00-\x7F]/g, '')}`;
      
      // Get the current user session to confirm we're authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error("No active session found - user not authenticated");
        throw new Error("Authentication required. Please log in again.");
      }
      
      console.log("Authenticated as:", sessionData.session.user.email);
      
      const { data, error } = await supabase.storage
        .from("personalities")
        .upload(fileName, file);

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      if (data) {
        console.log("Upload successful, getting public URL for:", data.path);
        // Get the permanent public URL after successful upload
        const { data: urlData } = await supabase.storage
          .from("personalities")
          .getPublicUrl(data.path);

        // Store the permanent URL
        console.log("Public URL obtained:", urlData.publicUrl);
        setImageUrl(urlData.publicUrl);
        
        toast({
          title: "Image uploaded",
          description: "The image was successfully uploaded",
        });
        
        return urlData.publicUrl;
      }
      return "";
    } catch (error: any) {
      console.error("Error in handleImageSelected:", error);
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload image",
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
