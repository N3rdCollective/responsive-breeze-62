
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { RegistrationFormValues } from "./RegistrationForm";

interface ReasonToJoinFieldProps {
  form: UseFormReturn<RegistrationFormValues>;
  disabled: boolean;
}

export const ReasonToJoinField = ({ form, disabled }: ReasonToJoinFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="reasonToJoin"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Reason to Join (Optional)</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Tell us a bit about why you want to join our team..." 
              className="resize-none"
              {...field} 
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
