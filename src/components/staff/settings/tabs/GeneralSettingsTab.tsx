
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SystemSettingsFormValues } from "@/types/settings";

const GeneralSettingsTab = () => {
  const form = useFormContext<SystemSettingsFormValues>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">General Settings</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Configure the basic information for your website.
      </p>
      
      <div className="grid gap-4">
        <FormField
          control={form.control}
          name="site_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter site title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="site_tagline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Tagline</FormLabel>
              <FormControl>
                <Input placeholder="Enter site tagline" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default GeneralSettingsTab;
