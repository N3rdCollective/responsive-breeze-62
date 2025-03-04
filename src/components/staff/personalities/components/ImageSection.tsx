
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../types";
import ImageUploader from "@/components/news/editor/ImageUploader";
import { useEffect } from "react";

interface ImageSectionProps {
  form: UseFormReturn<FormValues>;
  onImageSelected: (file: File) => void;
  previewUrl?: string | null;
}

const ImageSection = ({ form, onImageSelected, previewUrl }: ImageSectionProps) => {
  // Get the current value from the form
  const currentImageUrl = form.watch("image_url");
  
  // Update the form value if we have a new permanent URL
  useEffect(() => {
    if (currentImageUrl && !currentImageUrl.startsWith("blob:")) {
      form.setValue("image_url", currentImageUrl);
    }
  }, [currentImageUrl, form]);

  return (
    <FormField
      control={form.control}
      name="image_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Profile Image</FormLabel>
          <FormControl>
            <div>
              <input 
                type="hidden" 
                {...field} 
              />
              <ImageUploader
                currentImageUrl={previewUrl || field.value}
                onImageSelected={onImageSelected}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ImageSection;
