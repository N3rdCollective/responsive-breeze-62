
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
      console.log("Uploading image file:", file.name, file.size, file.type);
      
      // Check authentication before proceeding
      const { data: sessionData, error: authError } = await supabase.auth.getSession();
      if (authError) {
        console.error("Auth error:", authError);
        toast({
          title: "Authentication Error",
          description: "Failed to verify your session",
          variant: "destructive",
        });
        return null;
      }
      
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
      
      // Skip checking buckets since we know media exists (we just tried to create it)
      console.log("Proceeding with upload to the media bucket");
      
      // Direct file upload approach
      const fileExt = file.name.split('.').pop();
      // Ensure unique filenames by adding timestamp and random string
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const filePath = `news/${uniqueId}.${fileExt}`;
      
      console.log("Attempting upload to path:", filePath);
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true
        });
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        
        // Handle common upload errors
        if (uploadError.message.includes("storage/object_exists")) {
          toast({
            title: "File Exists",
            description: "A file with this name already exists. Please try again with a different file.",
            variant: "destructive",
          });
        } else if (uploadError.message.includes("storage/unauthorized")) {
          toast({
            title: "Upload Unauthorized",
            description: "You don't have permission to upload to this location.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Upload Failed",
            description: `Error: ${uploadError.message}`,
            variant: "destructive",
          });
        }
        return null;
      }
      
      console.log("Upload successful:", uploadData);
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);
        
      console.log("Upload URL:", urlData.publicUrl);
      
      toast({
        title: "Image Uploaded",
        description: "Image was successfully uploaded",
      });
      
      return urlData.publicUrl;
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
