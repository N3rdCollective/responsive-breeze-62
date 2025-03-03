
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "../types";

interface SocialLinksSectionProps {
  form: UseFormReturn<FormValues>;
}

const SocialLinksSection = ({ form }: SocialLinksSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <FormField
        control={form.control}
        name="twitter"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Twitter URL</FormLabel>
            <FormControl>
              <Input {...field} placeholder="https://twitter.com/username" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="instagram"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Instagram URL</FormLabel>
            <FormControl>
              <Input {...field} placeholder="https://instagram.com/username" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="facebook"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Facebook URL</FormLabel>
            <FormControl>
              <Input {...field} placeholder="https://facebook.com/username" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default SocialLinksSection;
