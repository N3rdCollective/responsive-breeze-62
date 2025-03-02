
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistrationForm } from "@/components/staff/registration/RegistrationForm";
import { RegistrationSuccess } from "@/components/staff/registration/RegistrationSuccess";

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
  );
};

export default StaffRegistration;
