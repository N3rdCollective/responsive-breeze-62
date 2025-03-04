
import { handleImageUpload as uploadImage } from "../ImageUploader";
import { useToast } from "@/hooks/use-toast";

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
      
      // Return the absolute URL to ensure it works everywhere
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
