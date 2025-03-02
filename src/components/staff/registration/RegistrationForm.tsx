
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form } from "@/components/ui/form";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { CredentialsFields } from "./CredentialsFields";
import { ReasonToJoinField } from "./ReasonToJoinField";

// Form validation schema
export const registrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
  reasonToJoin: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  onSubmitSuccess: () => void;
}

export const RegistrationForm = ({ onSubmitSuccess }: RegistrationFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      displayName: "",
      email: "",
      password: "",
      confirmPassword: "",
      reasonToJoin: "",
    },
  });

  const onSubmit = async (values: RegistrationFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      // First check if the email already exists in staff or pending_staff
      const { data: existingStaff, error: staffCheckError } = await supabase
        .from("staff")
        .select("*")
        .eq("email", values.email)
        .single();

      if (!staffCheckError && existingStaff) {
        setError("This email is already registered as a staff member.");
        return;
      }

      // Check if email already exists in pending_staff
      const { data: existingPending, error: pendingCheckError } = await supabase
        .from("pending_staff")
        .select("*")
        .eq("email", values.email)
        .single();

      if (!pendingCheckError && existingPending) {
        if (existingPending.status === 'rejected') {
          setError("Your previous registration request was rejected. Please contact an administrator.");
        } else {
          setError("You have already submitted a registration request. Please wait for approval.");
        }
        return;
      }

      // Create account in auth first
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            display_name: values.displayName,
            reason_to_join: values.reasonToJoin || "",
          }
        }
      });

      if (signupError) throw signupError;

      // Add to pending_staff table with status 'requested'
      const { error: pendingError } = await supabase
        .from("pending_staff")
        .insert({ 
          email: values.email,
          status: 'requested',
          invited_at: new Date().toISOString(),
        });

      if (pendingError) {
        console.error("Error creating pending_staff record:", pendingError);
        throw new Error("Failed to complete registration. Please try again.");
      }

      toast({
        title: "Registration submitted",
        description: "Your request has been submitted and is pending approval by an admin.",
      });
      
      onSubmitSuccess();
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <PersonalInfoFields form={form} disabled={isLoading} />
          <CredentialsFields form={form} disabled={isLoading} />
          <ReasonToJoinField form={form} disabled={isLoading} />
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Registration
          </Button>
        </form>
      </Form>
    </>
  );
};
