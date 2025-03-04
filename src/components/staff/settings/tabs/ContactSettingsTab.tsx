
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SystemSettingsFormValues } from "@/types/settings";

const ContactSettingsTab = () => {
  const form = useFormContext<SystemSettingsFormValues>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Social Media Links</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Configure social media links displayed on the website.
      </p>
      
      <div className="grid gap-4">        
        <FormField
          control={form.control}
          name="social_media_links.facebook"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Facebook</FormLabel>
              <FormControl>
                <Input placeholder="https://facebook.com/yourpage" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="social_media_links.twitter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Twitter</FormLabel>
              <FormControl>
                <Input placeholder="https://twitter.com/yourhandle" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="social_media_links.instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram</FormLabel>
              <FormControl>
                <Input placeholder="https://instagram.com/yourprofile" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="social_media_links.youtube"
          render={({ field }) => (
            <FormItem>
              <FormLabel>YouTube</FormLabel>
              <FormControl>
                <Input placeholder="https://youtube.com/yourchannel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ContactSettingsTab;
