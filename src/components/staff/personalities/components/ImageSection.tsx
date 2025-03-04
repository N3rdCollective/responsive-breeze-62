
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../types";
import ImageUploader from "@/components/news/editor/ImageUploader";
import { Loader2 } from "lucide-react";

interface ImageSectionProps {
  form: UseFormReturn<FormValues>;
  onImageSelected: (file: File) => void;
  isUploading?: boolean;
}

const ImageSection = ({ form, onImageSelected, isUploading = false }: ImageSectionProps) => {
  // Get the current value from the form
  const currentImageUrl = form.watch("image_url");

  return (
    <FormField
      control={form.control}
      name="image_url"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Profile Image</FormLabel>
          <FormControl>
            <div className="relative">
              <input 
                type="hidden" 
                {...field} 
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-md z-10">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
              <ImageUploader
                currentImageUrl={field.value}
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
