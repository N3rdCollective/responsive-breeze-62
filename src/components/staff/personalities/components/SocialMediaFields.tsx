
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { PersonalityFormValues } from "../schema/personalityFormSchema";

interface SocialMediaFieldsProps {
  form: UseFormReturn<PersonalityFormValues>;
}

export const SocialMediaFields = ({ form }: SocialMediaFieldsProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Social Media Links</h3>
      
      <FormField
        control={form.control}
        name="social_links.twitter"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Twitter URL</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://twitter.com/username" 
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
        name="social_links.instagram"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Instagram URL</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://instagram.com/username" 
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
        name="social_links.facebook"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Facebook URL</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://facebook.com/username" 
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
