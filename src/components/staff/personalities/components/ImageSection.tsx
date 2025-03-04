
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../types";
import ImageUploader from "@/components/news/editor/ImageUploader";

interface ImageSectionProps {
  form: UseFormReturn<FormValues>;
  onImageSelected: (file: File) => void;
}

const ImageSection = ({ form, onImageSelected }: ImageSectionProps) => {
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
            <div>
              <input 
                type="hidden" 
                {...field} 
              />
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
