
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistrationForm } from "@/components/staff/registration/RegistrationForm";
import { RegistrationSuccess } from "@/components/staff/registration/RegistrationSuccess";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react"; 

const StaffRegistration = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const handleRegistrationSuccess = () => {
    setSuccess(true);
    
    // Redirect after short delay
    setTimeout(() => {
      navigate("/staff-login");
    }, 3000);
  };

  const handleBackToLogin = () => {
    navigate("/staff-login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex flex-col items-center">
      <div className="mb-8">
        <img src="/placeholder.svg" alt="Radio FM Logo" className="h-16 w-auto" />
      </div>
      
      <div className="w-full max-w-md mx-auto flex flex-col gap-4">
        <Button 
          variant="ghost" 
          className="self-start flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white" 
          onClick={handleBackToLogin}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Button>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Staff Registration</CardTitle>
            <CardDescription>
              Register to join our team. Your request will be reviewed by an admin.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {success ? (
              <RegistrationSuccess />
            ) : (
              <RegistrationForm onSubmitSuccess={handleRegistrationSuccess} />
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
    </div>
  );
};

export default StaffRegistration;
