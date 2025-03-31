
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

const StaffLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/staff/panel");
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting login with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      if (data?.user) {
        console.log("User authenticated, checking staff permissions");
        
        // Check if the user is staff by querying the staff table
        const { data: staffData, error: staffError } = await supabase
          .from("staff")
          .select("*")
          .eq("id", data.user.id)
          .single();
          
        if (staffError || !staffData) {
          console.error("Staff check error:", staffError);
          // If no staff record, log them out
          await supabase.auth.signOut();
          throw new Error("You don't have permission to access the staff panel.");
        }
        
        console.log("Staff permissions confirmed, redirecting to staff panel");
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${staffData.first_name || email}!`,
        });
        
        // Redirect to staff panel
        navigate("/staff/panel");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-md mx-auto px-4 pt-24 pb-16">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tighter text-black dark:text-[#FFD700] sm:text-4xl">Staff Login</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Welcome back! Please login to access the staff portal.
            </p>
          </div>

          <div className="bg-[#F5F5F5] dark:bg-[#333333] border border-[#666666]/20 dark:border-white/10 p-6 rounded-lg">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-black dark:text-white"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-white dark:bg-[#222222] border-[#666666]/20 dark:border-white/10 text-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="password"
                  className="text-black dark:text-white"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-white dark:bg-[#222222] border-[#666666]/20 dark:border-white/10 text-black dark:text-white"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : "Login"}
              </Button>
            </form>

            <div className="mt-4 text-center space-y-2">
              <Link 
                to="/staff/registration" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors block"
              >
                Register as new staff member
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StaffLogin;
