
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "react-router-dom";

const StaffRegistration = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    employeeId: "",
    department: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }
    
    // Here you would typically handle registration
    console.log("Registration attempt:", { ...formData, password: "REDACTED" });
    
    toast({
      title: "Registration attempted",
      description: "This is a demo. Registration needs to be implemented.",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-md mx-auto px-4 pt-24 pb-16">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tighter text-black dark:text-[#FFD700] sm:text-4xl">
              Staff Registration
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Create your staff account to access the portal.
            </p>
          </div>

          <div className="bg-[#F5F5F5] dark:bg-[#333333] border border-[#666666]/20 dark:border-white/10 p-6 rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="fullName"
                  className="text-black dark:text-white"
                >
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="bg-white dark:bg-[#222222] border-[#666666]/20 dark:border-white/10 text-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="email"
                  className="text-black dark:text-white"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white dark:bg-[#222222] border-[#666666]/20 dark:border-white/10 text-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="employeeId"
                  className="text-black dark:text-white"
                >
                  Employee ID
                </Label>
                <Input
                  id="employeeId"
                  name="employeeId"
                  type="text"
                  placeholder="Enter your employee ID"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                  className="bg-white dark:bg-[#222222] border-[#666666]/20 dark:border-white/10 text-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="department"
                  className="text-black dark:text-white"
                >
                  Department
                </Label>
                <Input
                  id="department"
                  name="department"
                  type="text"
                  placeholder="Enter your department"
                  value={formData.department}
                  onChange={handleChange}
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
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-white dark:bg-[#222222] border-[#666666]/20 dark:border-white/10 text-black dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="confirmPassword"
                  className="text-black dark:text-white"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="bg-white dark:bg-[#222222] border-[#666666]/20 dark:border-white/10 text-black dark:text-white"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Register
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link 
                to="/staff-login" 
                className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                Already have an account? Login
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StaffRegistration;
