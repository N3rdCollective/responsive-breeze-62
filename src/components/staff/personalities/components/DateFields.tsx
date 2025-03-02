
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { PersonalityFormValues } from "../schema/personalityFormSchema";

interface DateFieldsProps {
  form: UseFormReturn<PersonalityFormValues>;
}

export const DateFields = ({ form }: DateFieldsProps) => {
  return (
    <FormField
      control={form.control}
      name="start_date"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Start Date</FormLabel>
          <FormControl>
            <Input 
              type="date" 
              {...field}
              value={field.value || ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
