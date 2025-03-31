
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import ImageUploader from "../ImageUploader";
import { FormValues } from "./types";
import { Progress } from "@/components/ui/progress";

interface UploadProgress {
  percentage: number;
  fileName: string;
  bytesUploaded?: number;
  totalBytes?: number;
}

interface ImageSectionProps {
  form: UseFormReturn<FormValues>;
  isArchived: boolean;
  isUploading: boolean;
  uploadProgress?: UploadProgress | null;
  uploadError?: string | null;
  onImageSelected: (file: File) => Promise<string | null>;
}

const ImageSection: React.FC<ImageSectionProps> = ({ 
  form, 
  isArchived, 
  isUploading, 
  uploadProgress,
  uploadError,
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
          
          {isUploading && uploadProgress && (
            <div className="mt-2">
              <Progress value={uploadProgress.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Uploading: {uploadProgress.percentage}% complete
                {uploadProgress.bytesUploaded && uploadProgress.totalBytes && (
                  <span> ({(uploadProgress.bytesUploaded / 1024).toFixed(1)}KB / {(uploadProgress.totalBytes / 1024).toFixed(1)}KB)</span>
                )}
              </p>
            </div>
          )}
          
          {uploadError && !isUploading && (
            <p className="text-xs text-destructive mt-1">{uploadError}</p>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ImageSection;
