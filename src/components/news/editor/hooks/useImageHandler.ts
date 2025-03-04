
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
      
      // Check if the media bucket exists and is accessible
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error("Error fetching storage buckets:", bucketsError);
        toast({
          title: "Storage Access Error",
          description: "Unable to access storage. Please try again later.",
          variant: "destructive",
        });
        return null;
      }
      
      console.log("Available storage buckets:", buckets?.map(b => b.name).join(', '));
      
      const mediaBucketExists = buckets?.some(bucket => bucket.name === "media");
      if (!mediaBucketExists) {
        console.error("Media bucket not found in available buckets");
        toast({
          title: "Configuration Error",
          description: "Storage is not properly configured. Please contact support.",
          variant: "destructive",
        });
        return null;
      }
      
      console.log("Media bucket verified, proceeding with upload");
      
      // Direct file upload approach as a test
      const fileExt = file.name.split('.').pop();
      const filePath = `news/direct_${Date.now()}.${fileExt}`;
      
      console.log("Attempting direct upload to path:", filePath);
      
      const { error: directUploadError, data: directUploadData } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true
        });
        
      if (directUploadError) {
        console.error("Direct upload error:", directUploadError);
        toast({
          title: "Direct Upload Failed",
          description: `Error: ${directUploadError.message}`,
          variant: "destructive",
        });
        
        // Still try the regular upload method as fallback
        console.log("Trying fallback upload method...");
      } else {
        console.log("Direct upload successful:", directUploadData);
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from("media")
          .getPublicUrl(filePath);
          
        console.log("Direct upload URL:", urlData.publicUrl);
        
        toast({
          title: "Image Uploaded",
          description: "Image was successfully uploaded directly",
        });
        
        return urlData.publicUrl;
      }
      
      // Fallback to the original upload method
      const uploadedUrl = await uploadImage(file);
      
      if (!uploadedUrl) {
        console.error("Both upload methods failed");
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
