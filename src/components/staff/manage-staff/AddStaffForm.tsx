
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
      
      console.log("Sending invitation to:", values.email);
      
      // Call our Edge Function to invite staff with improved error handling
      const { data, error: functionError } = await supabase.functions.invoke('invite-staff', {
        body: { email: values.email },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (functionError) {
        console.error("Edge function error:", functionError);
        throw new Error(`Failed to communicate with the server: ${functionError.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No response received from server');
      }
      
      // Check for error in the response data
      if (data.error) {
        throw new Error(data.error);
      }
      
      console.log("Invitation sent successfully:", data);
      
      toast({
        title: "Invitation Email Sent",
        description: `An invitation has been sent to ${values.email}. They will need to complete signup and await approval.`,
      });
      
      form.reset();
      onStaffAdded();
    } catch (error: any) {
      console.error("Error adding staff:", error);
      const errorMessage = error.message || "An unexpected error occurred";
      
      // Improve error message based on specific issues
      let displayErrorMessage = errorMessage;
      
      // Check for email already exists as staff member
      if (errorMessage.includes("already registered as a staff member")) {
        displayErrorMessage = "This email is already registered as a staff member.";
      } 
      // Check for connection issues
      else if (errorMessage.includes("Failed to communicate")) {
        displayErrorMessage = "Connection issue with the server. Please try again or contact support.";
      }
      
      setError(`Failed to add staff member: ${displayErrorMessage}`);
      
      toast({
        title: "Error",
        description: `Failed to send invitation: ${displayErrorMessage}`,
        variant: "destructive",
      });
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
              {isAddingStaff ? "Sending Invite..." : "Invite Staff"}
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
