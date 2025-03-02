
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Form validation schema
const registrationSchema = z.object({
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

const StaffRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof registrationSchema>>({
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

  const onSubmit = async (values: z.infer<typeof registrationSchema>) => {
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

      setSuccess(true);
      toast({
        title: "Registration submitted",
        description: "Your request has been submitted and is pending approval by an admin.",
      });

      // Redirect after short delay
      setTimeout(() => {
        navigate("/staff-login");
      }, 3000);
    } catch (error: any) {
      console.error("Registration error:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex flex-col items-center">
      <div className="mb-8">
        <img src="/placeholder.svg" alt="Radio FM Logo" className="h-16 w-auto" />
      </div>
      
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Staff Registration</CardTitle>
          <CardDescription>
            Register to join our team. Your request will be reviewed by an admin.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success ? (
            <div className="text-center py-6">
              <div className="mb-4 flex justify-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Registration Complete!</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Your registration request has been submitted and is pending approval. Redirecting to login page...
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="DJ Awesome" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        This is how your name will appear on the site
                      </p>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="you@example.com" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <a href="/staff-login" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StaffRegistration;
