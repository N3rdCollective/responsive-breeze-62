
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../types";
import ImageSection from "./ImageSection";
import SocialLinksSection from "./SocialLinksSection";

interface PersonalityFormContentProps {
  form: UseFormReturn<FormValues>;
  onImageSelected: (file: File) => void;
  isUploading?: boolean;
}

const PersonalityFormContent = ({ form, onImageSelected, isUploading = false }: PersonalityFormContentProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Name" />
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
                <Input {...field} placeholder="e.g. DJ, Host, Producer" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => {
          // Clean up the field value if it's "• -"
          const displayValue = field.value === "• -" ? "" : field.value;
          
          return (
            <FormItem>
              <FormLabel>Biography</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Enter biography here..." 
                  className="min-h-[120px]"
                  onChange={(e) => {
                    // Prevent setting the value to "• -" and clean up if it's already there
                    const value = e.target.value;
                    if (value === "• -") {
                      field.onChange("");
                    } else {
                      field.onChange(value);
                    }
                  }}
                  value={displayValue}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      
      <ImageSection 
        form={form} 
        onImageSelected={onImageSelected}
        isUploading={isUploading}
      />
      
      <SocialLinksSection form={form} />
    </>
  );
};

export default PersonalityFormContent;
