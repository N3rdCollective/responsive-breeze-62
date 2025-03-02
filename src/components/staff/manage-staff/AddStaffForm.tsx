
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

interface AddStaffFormProps {
  onStaffAdded: () => void;
  currentUserRole: string;
}

// Create a schema for email validation
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

const AddStaffForm = ({ onStaffAdded, currentUserRole }: AddStaffFormProps) => {
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const canAddStaff = currentUserRole === "admin" || currentUserRole === "super_admin";
  
  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ""
    }
  });

  const handleAddStaff = async (values: z.infer<typeof formSchema>) => {
    if (!canAddStaff) {
      setError("You don't have permission to add staff members. Only admins and super admins can add staff.");
      return;
    }

    try {
      setIsAddingStaff(true);
      setError(null);
      
      // Check if staff already exists
      const { data: existingStaff } = await supabase
        .from("staff")
        .select("*")
        .eq("email", values.email)
        .single();
      
      if (existingStaff) {
        toast({
          title: "Staff Already Exists",
          description: `${values.email} is already a staff member.`,
          variant: "destructive",
        });
        return;
      }
      
      // Default role for new staff is "staff"
      const defaultRole = "staff";
      
      // First, create a user in auth.users through the Supabase admin API
      // Then the trigger will create the staff record automatically
      
      // Create an invite link (temporary solution)
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
        values.email
      );
      
      if (inviteError) {
        console.error("Error inviting user:", inviteError);
        setError(`Failed to add staff member: ${inviteError.message}`);
        return;
      }
      
      toast({
        title: "Staff Added",
        description: `${values.email} has been added to the staff. An invitation has been sent to their email.`,
      });
      
      form.reset();
      onStaffAdded();
    } catch (error) {
      console.error("Error adding staff:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsAddingStaff(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleAddStaff)} className="space-y-4">
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="staff@radiofm.com"
                      {...field}
                      disabled={isAddingStaff || !canAddStaff}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit"
              disabled={isAddingStaff || !canAddStaff}
            >
              {isAddingStaff ? "Adding..." : "Add Staff"}
            </Button>
          </div>
        </form>
      </Form>
      
      {!canAddStaff && (
        <p className="text-sm text-gray-500">
          Only admins and super admins can add new staff members.
        </p>
      )}
    </div>
  );
};

export default AddStaffForm;
