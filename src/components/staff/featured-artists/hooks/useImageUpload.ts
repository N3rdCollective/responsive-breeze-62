
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UploadProgress {
  percentage: number;
  fileName: string;
  bytesUploaded?: number;
  totalBytes?: number;
}

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  /**
   * Uploads an image file to Supabase storage
   * @param file The file to upload
   * @returns The public URL of the uploaded file or null if the upload failed
   */
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress({
        percentage: 0,
        fileName: file.name
      });
      
      console.log("Uploading image file:", file.name, "size:", (file.size / 1024).toFixed(2), "KB");
      
      // Validate file size (max 10MB)
      const maxSizeMB = 10;
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`File size exceeds the maximum allowed size of ${maxSizeMB}MB`);
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not supported. Please use JPEG, PNG, GIF or WEBP.`);
      }
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const sanitizedFileName = file.name
        .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
        .replace(/\s+/g, '_'); // Replace spaces with underscores
        
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `lovable-uploads/${fileName}`;
      
      // Update progress to 10% for preparation
      setUploadProgress({
        percentage: 10,
        fileName: file.name,
        bytesUploaded: 0,
        totalBytes: file.size
      });
      
      // Upload to public folder
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Error uploading image: ${uploadError.message}`);
      }
      
      // Update progress to 90% after upload
      setUploadProgress({
        percentage: 90,
        fileName: file.name,
        bytesUploaded: file.size,
        totalBytes: file.size
      });
      
      // Get the public URL
      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
      
      // Update progress to 100% when complete
      setUploadProgress({
        percentage: 100,
        fileName: file.name,
        bytesUploaded: file.size,
        totalBytes: file.size
      });
      
      console.log("Uploaded successfully, public URL:", data.publicUrl);
      return data.publicUrl;
    } catch (error: any) {
      console.error("Error in uploadImage:", error);
      setUploadError(error.message || "Failed to upload image");
      return null;
    } finally {
      // Reset upload state after a delay so the user can see the 100% state
      setTimeout(() => {
        setIsUploading(false);
        // We don't reset progress here so the UI can show the final state if needed
      }, 500);
    }
  };

  /**
   * Reset upload state
   */
  const resetUploadState = () => {
    setIsUploading(false);
    setUploadProgress(null);
    setUploadError(null);
  };

  return { 
    uploadImage, 
    isUploading, 
    uploadProgress, 
    uploadError,
    resetUploadState 
  };
};
