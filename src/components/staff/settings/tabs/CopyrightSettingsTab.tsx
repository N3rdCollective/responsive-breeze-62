
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SystemSettingsFormValues } from "@/types/settings";

interface CopyrightSettingsTabProps {
  form: UseFormReturn<SystemSettingsFormValues>;
}

const CopyrightSettingsTab = ({ form }: CopyrightSettingsTabProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Copyright Information</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Configure the copyright text displayed in the website footer.
      </p>
      
      <div className="grid gap-4">
        <FormField
          control={form.control}
          name="copyright_text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Copyright Text</FormLabel>
              <FormControl>
                <Input placeholder="© 2023 Your Company. All rights reserved." {...field} />
              </FormControl>
              <FormDescription>
                Use © for the copyright symbol. The current year will be added automatically.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default CopyrightSettingsTab;
