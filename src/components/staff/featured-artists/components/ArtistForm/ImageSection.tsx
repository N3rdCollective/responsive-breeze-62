
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import ImageUploader from "../ImageUploader";
import { FormValues } from "./types";

interface ImageSectionProps {
  form: UseFormReturn<FormValues>;
  isArchived: boolean;
  isUploading: boolean;
  onImageSelected: (file: File) => Promise<string | null>;
}

const ImageSection: React.FC<ImageSectionProps> = ({ 
  form, 
  isArchived, 
  isUploading, 
  onImageSelected 
}) => {
  // Handler for image selection that updates the form
  const handleImageSelected = async (file: File) => {
    try {
      const imageUrl = await onImageSelected(file);
      if (imageUrl) {
        form.setValue("image_url", imageUrl);
      }
    } catch (error) {
      console.error("Error handling image selection:", error);
    }
  };

  return (
    <FormField
      control={form.control}
      name="image_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Artist Image</FormLabel>
          <FormControl>
            <ImageUploader 
              currentImageUrl={field.value}
              onImageSelected={handleImageSelected}
              onImageUrlChange={(url) => form.setValue("image_url", url)}
              isUploading={isUploading}
              disabled={isArchived}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ImageSection;
