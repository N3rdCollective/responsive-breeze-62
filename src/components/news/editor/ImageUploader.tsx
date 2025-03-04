
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ImageUploaderProps {
  currentImageUrl: string;
  onImageSelected: (file: File) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ currentImageUrl, onImageSelected }) => {
  return (
    <div>
      <Label htmlFor="featured-image">Featured Image</Label>
      <div className="mt-2">
        <Input
          id="featured-image"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
              onImageSelected(files[0]);
            }
          }}
        />
        <p className="text-sm text-muted-foreground mt-1">
          Select an image to use as the featured image for this post
        </p>
      </div>
      
      {currentImageUrl && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Current image:</p>
          <img
            src={currentImageUrl}
            alt="Featured"
            className="w-full max-w-md rounded-md"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

// Export helper function to handle image uploads
export const handleImageUpload = async (file: File): Promise<string | null> => {
  if (!file) return null;
  
  try {
    console.log("Starting image upload process for:", file.name);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `news/${fileName}`;
    
    console.log("Generated file path:", filePath);
    
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from("media")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false
      });
      
    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw uploadError;
    }
    
    console.log("Upload successful:", uploadData);
    
    const { data } = supabase.storage
      .from("media")
      .getPublicUrl(filePath);
      
    console.log("Public URL generated:", data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};
