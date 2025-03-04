
import { handleImageUpload as uploadImage } from "../ImageUploader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useImageHandler = () => {
  const { toast } = useToast();

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!file) {
      console.error("No file provided to handleImageUpload");
      toast({
        title: "Upload Error",
        description: "No file provided for upload",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      console.log("Uploading image file:", file.name, file.size);
      
      // Check authentication before proceeding
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error("No active session found - user not authenticated");
        toast({
          title: "Authentication Required",
          description: "Please log in to upload images",
          variant: "destructive",
        });
        return null;
      }
      
      console.log("Authenticated as:", sessionData.session.user.email);
      
      const uploadedUrl = await uploadImage(file);
      
      if (!uploadedUrl) {
        toast({
          title: "Image Upload Failed",
          description: "Unable to upload the image. Please try again.",
          variant: "destructive",
        });
        return null;
      }
      
      console.log("Image uploaded successfully, URL:", uploadedUrl);
      
      toast({
        title: "Image Uploaded",
        description: "Image was successfully uploaded",
      });
      
      return uploadedUrl;
    } catch (error) {
      console.error("Error in handleImageUpload:", error);
      toast({
        title: "Image Upload Error",
        description: `Failed to upload image: ${(error as Error)?.message || "Unknown error"}`,
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    handleImageUpload
  };
};
