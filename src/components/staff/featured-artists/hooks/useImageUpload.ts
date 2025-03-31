
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useImageUpload = () => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      
      console.log("Starting image upload for featured artist:", file.name);
      
      // Sanitize filename to remove non-ASCII characters
      const sanitizedFileName = file.name.replace(/[^\x00-\x7F]/g, '');
      const fileExt = sanitizedFileName.split('.').pop();
      // Generate a unique filename to prevent collisions
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `artists/${fileName}`;
      
      console.log("Generated file path:", filePath);
      
      // Get the current user session to confirm we're authenticated
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error("Failed to verify authentication session");
      }
      
      if (!sessionData.session) {
        console.error("No active session found - user not authenticated");
        throw new Error("Authentication required. Please log in again.");
      }
      
      console.log("Authenticated as:", sessionData.session.user.email);
      
      // Upload the file to Supabase storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true
        });
        
      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw uploadError;
      }
      
      console.log("Upload successful:", uploadData);
      
      // Get the public URL for the uploaded file
      const { data } = supabase.storage
        .from("media")
        .getPublicUrl(filePath);
        
      console.log("Public URL generated:", data.publicUrl);
      
      toast({
        title: "Image uploaded",
        description: "Image has been uploaded successfully"
      });
      
      return data.publicUrl;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading
  };
};
