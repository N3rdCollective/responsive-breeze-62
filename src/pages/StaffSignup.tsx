
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Form validation schema
const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const StaffSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  // Get email from URL
  useEffect(() => {
    const email = searchParams.get("email");
    setEmail(email);
    
    // Redirect if no email provided
    if (!email) {
      toast({
        title: "Invalid signup link",
        description: "Please use the link that was sent to your email",
        variant: "destructive",
      });
      navigate("/staff-login");
    }
  }, [searchParams, navigate, toast]);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if the user exists in pending_staff table
      const { data: pendingStaff, error: pendingError } = await supabase
        .from("pending_staff")
        .select("*")
        .eq("email", email)
        .single();

      if (pendingError || !pendingStaff) {
        setError("Your invitation wasn't found or has expired. Please contact an administrator.");
        return;
      }

      if (pendingStaff.status === 'rejected') {
        setError("Your invitation has been rejected. Please contact an administrator.");
        return;
      }

      // Create account
      const { error: signupError } = await supabase.auth.signUp({
        email: email!,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
          }
        }
      });

      if (signupError) throw signupError;

      setSuccess(true);
      toast({
        title: "Account created successfully",
        description: pendingStaff.status === 'approved' 
          ? "You can now log in to the staff panel." 
          : "Your account is pending approval. You'll be notified when approved.",
      });

      // Redirect after short delay
      setTimeout(() => {
        navigate("/staff-login");
      }, 3000);
    } catch (error: any) {
      console.error("Signup error:", error);
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
          <CardTitle>Complete Staff Registration</CardTitle>
          <CardDescription>
            {email ? `Create your account for ${email}` : 'Complete your registration to access the staff panel'}
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
                Your account has been created. Redirecting to login page...
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
                
                <div className="pt-2">
                  <Label>Email</Label>
                  <Input value={email || ""} disabled />
                </div>
                
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
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Registration
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

export default StaffSignup;
