
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { PersonalityFormValues } from "../schema/personalityFormSchema";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

interface BasicInfoFieldsProps {
  form: UseFormReturn<PersonalityFormValues>;
  currentImageUrl?: string;
}

export const BasicInfoFields = ({ form, currentImageUrl }: BasicInfoFieldsProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image_file", file);
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <FormControl>
              <Input placeholder="DJ / Host / Producer" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter personality biography..."
                className="min-h-[150px]"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="image_file"
        render={() => (
          <FormItem>
            <FormLabel>Profile Image</FormLabel>
            <div className="flex flex-col space-y-4">
              <Input 
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {previewUrl && (
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={previewUrl} alt="Preview" />
                    <AvatarFallback>
                      {form.getValues("name")?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">Preview</span>
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
