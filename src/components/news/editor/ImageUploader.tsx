
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
      </div>
      
      {currentImageUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Current image:</p>
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
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `news/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(filePath, file);
      
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from("media")
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};
