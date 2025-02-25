
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "react-router-dom";

const StaffLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically handle authentication
    console.log("Login attempt:", { email });
    
    toast({
      title: "Login attempted",
      description: "This is a demo. Authentication needs to be implemented.",
    });
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
                  className="bg-white dark:bg-[#222222] border-[#666666]/20 dark:border-white/10 text-black dark:text-white"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Login
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link 
                to="/staff-panel" 
                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Demo: Skip Login
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
