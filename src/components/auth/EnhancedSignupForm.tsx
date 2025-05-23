
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, User, Mail, Lock, Check, X, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  acceptMarketing: boolean;
}

interface ValidationErrors {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  acceptTerms?: string;
  apiError?: string;
}

interface EnhancedSignupFormProps {
  onSwitchToSignIn: () => void;
}

const EnhancedSignupForm: React.FC<EnhancedSignupFormProps> = ({ onSwitchToSignIn }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false,
    acceptMarketing: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    strength = Object.values(checks).filter(Boolean).length;
    return { strength, checks };
  };

  const { strength: passwordStrength, checks: passwordChecks } = calculatePasswordStrength(formData.password);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validateUsername = (username: string) => {
    if (!username) return 'Username is required';
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (passwordStrength < 3 && password.length > 0) return 'Password is too weak. Include uppercase, lowercase, numbers, and special characters.';
    return '';
  };

  const validateStep = (step: number) => {
    const newErrors: ValidationErrors = {};
    if (errors.apiError) newErrors.apiError = errors.apiError; // preserve API error

    if (step >= 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;
    }

    if (step >= 2) {
      const usernameError = validateUsername(formData.username);
      if (usernameError) newErrors.username = usernameError;
      else if (usernameAvailable === false) newErrors.username = 'Username is not available';


      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;
      
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    if (step >= 3) {
      if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    const stepErrors = { ...errors, ...newErrors };
    // Filter out errors from future steps
    const relevantErrors: ValidationErrors = {};
    if (step === 1) {
        relevantErrors.firstName = stepErrors.firstName;
        relevantErrors.lastName = stepErrors.lastName;
        relevantErrors.email = stepErrors.email;
    } else if (step === 2) {
        relevantErrors.username = stepErrors.username;
        relevantErrors.password = stepErrors.password;
        relevantErrors.confirmPassword = stepErrors.confirmPassword;
    } else if (step === 3) {
        relevantErrors.acceptTerms = stepErrors.acceptTerms;
    }
    if (stepErrors.apiError) relevantErrors.apiError = stepErrors.apiError;


    setErrors(relevantErrors);
    return !Object.values(relevantErrors).some(error => error);
  };

  const checkUsernameAvailability = async (username: string) => {
    const usernameValidationError = validateUsername(username);
    if (usernameValidationError) {
      setErrors(prev => ({ ...prev, username: usernameValidationError }));
      setUsernameAvailable(null);
      return;
    }
    if (!username) {
        setUsernameAvailable(null);
        return;
    }

    setIsCheckingUsername(true);
    setUsernameAvailable(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116: "single row not found" is OK
        console.error('Error checking username:', error);
        setUsernameAvailable(null); // Indeterminate
      } else {
        setUsernameAvailable(!data); // Available if no data found
        if (data) {
          setErrors(prev => ({ ...prev, username: 'Username is not available' }));
        } else {
           // Clear only username error if it was 'Username is not available'
          if(errors.username === 'Username is not available') {
            setErrors(prev => ({ ...prev, username: undefined }));
          }
        }
      }
    } catch (e) {
      console.error('Exception checking username:', e);
      setUsernameAvailable(null);
    } finally {
      setIsCheckingUsername(false);
    }
  };
  
  // Debounce username check
  useEffect(() => {
    const handler = setTimeout(() => {
      if (formData.username && currentStep === 2) { // Only check if on step 2 and username has value
        checkUsernameAvailability(formData.username);
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [formData.username, currentStep]);


  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field as keyof ValidationErrors]: undefined, apiError: undefined }));

    if (field === 'username' && typeof value === 'string') {
      setUsernameAvailable(null); // Reset on change, useEffect will trigger check
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
       // If step 2 and username is being checked or not available, don't proceed
      if (currentStep === 2) {
        if (isCheckingUsername) {
            toast({ title: "Checking username...", variant: "default" });
            return;
        }
        if (usernameAvailable === false) {
            setErrors(prev => ({...prev, username: "Username is not available"}));
            return;
        }
         // Re-validate username specifically if it was previously null (e.g. user typed fast)
        if (usernameAvailable === null && formData.username) {
          checkUsernameAvailability(formData.username).then(() => {
            // After check completes, re-validate and then potentially move
            if (validateStep(currentStep) && usernameAvailable) { // Check usernameAvailable state AFTER check
              setCurrentStep(prev => Math.min(prev + 1, totalSteps));
            }
          });
          return; // Don't proceed immediately
        }
      }
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors(prev => ({ ...prev, apiError: undefined }));
  };

  const handleSubmit = async () => {
    setErrors(prev => ({ ...prev, apiError: undefined }));
    if (!validateStep(totalSteps)) return;
    if (isCheckingUsername) {
        toast({ title: "Please wait", description: "Still verifying username.", variant: "default" });
        return;
    }
    if (usernameAvailable === false) {
        setErrors(prev => ({ ...prev, username: "Username is not available. Please choose another."}));
        setCurrentStep(2); // Go back to username step
        return;
    }


    setIsLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            username: formData.username,
            display_name: `${formData.firstName} ${formData.lastName}`,
            user_role: "user", // Default role
            // marketing_preference: formData.acceptMarketing (if you add this to profiles table)
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data?.user) {
        toast({
          title: "Account created successfully!",
          description: "Please check your email for verification instructions.",
        });
        navigate("/"); // Or to a welcome page, or /profile
      } else {
        // Handle cases where user might be null but no error (e.g. email confirmation required)
         toast({
          title: "Registration submitted",
          description: "Please check your email for verification instructions to complete your signup.",
          duration: 7000,
        });
        navigate("/"); 
      }

    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors(prev => ({ ...prev, apiError: error.message || "An unexpected error occurred. Please try again." }));
      toast({
        title: "Signup Failed",
        description: error.message || "Could not create your account.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 1) return 'bg-red-500'; // Adjusted thresholds
    if (strength <= 2) return 'bg-yellow-500';
    if (strength <= 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 1) return 'Very Weak';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <Card className="w-full"> {/* Removed max-w-md to fit Auth.tsx styling */}
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
        <CardDescription className="text-muted-foreground">Step {currentStep} of {totalSteps}</CardDescription>
        <Progress value={progress} className="mt-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        {errors.apiError && (
            <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.apiError}</AlertDescription>
            </Alert>
        )}
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <p className="text-sm text-muted-foreground">Tell us about yourself</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                  className={errors.firstName ? 'border-red-500' : ''}
                  aria-invalid={!!errors.firstName}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Doe"
                  className={errors.lastName ? 'border-red-500' : ''}
                   aria-invalid={!!errors.lastName}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="email-enhanced">Email Address</Label> {/* Changed id to avoid conflict with main Auth page */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email-enhanced"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john@example.com"
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                   aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>
        )}

        {/* Step 2: Account Security */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Account Security</h3>
              <p className="text-sm text-muted-foreground">Choose your username and password</p>
            </div>

            <div>
              <Label htmlFor="username-enhanced">Username</Label> {/* Changed id */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username-enhanced"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="johndoe123"
                  className={`pl-10 pr-10 ${errors.username ? 'border-red-500' : ''} ${usernameAvailable === false ? 'border-red-500' : usernameAvailable === true ? 'border-green-500' : ''}`}
                  aria-invalid={!!errors.username || usernameAvailable === false}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isCheckingUsername ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> :
                     usernameAvailable === true ? <Check className="h-4 w-4 text-green-500" /> :
                     usernameAvailable === false ? <X className="h-4 w-4 text-red-500" /> : null
                    }
                </div>
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
              {/* Removed specific available/unavailable messages here as they are incorporated in general error or green border */}
            </div>

            <div>
              <Label htmlFor="password-enhanced">Password</Label> {/* Changed id */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password-enhanced"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a strong password"
                  className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Password strength:</span>
                    <span className={`font-medium ${passwordStrength >= 4 ? 'text-green-600' : passwordStrength >= 3 ? 'text-blue-600' : passwordStrength >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {[
                      { label: "8+ characters", valid: passwordChecks.length },
                      { label: "Uppercase", valid: passwordChecks.uppercase },
                      { label: "Lowercase", valid: passwordChecks.lowercase },
                      { label: "Numbers", valid: passwordChecks.numbers },
                      { label: "Special chars", valid: passwordChecks.special },
                    ].map(check => (
                      <div key={check.label} className={`flex items-center gap-1 ${check.valid ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {check.valid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {check.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword-enhanced">Confirm Password</Label> {/* Changed id */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword-enhanced"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your password"
                  className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  aria-invalid={!!errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
        )}

        {/* Step 3: Terms and Preferences */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Almost Done!</h3>
              <p className="text-sm text-muted-foreground">Review and accept our terms</p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Account Summary</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><span className="font-semibold text-foreground">Name:</span> {formData.firstName} {formData.lastName}</p>
                <p><span className="font-semibold text-foreground">Email:</span> {formData.email}</p>
                <p><span className="font-semibold text-foreground">Username:</span> {formData.username}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acceptTerms-enhanced"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => handleInputChange('acceptTerms', checked as boolean)}
                  aria-labelledby="acceptTermsLabel-enhanced"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="acceptTerms-enhanced" id="acceptTermsLabel-enhanced" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I accept the <button type="button" className="text-primary hover:underline">Terms of Service</button> and <button type="button" className="text-primary hover:underline">Privacy Policy</button>
                  </Label>
                </div>
              </div>
              {errors.acceptTerms && <p className="text-red-500 text-xs ml-8">{errors.acceptTerms}</p>}

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="acceptMarketing-enhanced"
                  checked={formData.acceptMarketing}
                  onCheckedChange={(checked) => handleInputChange('acceptMarketing', checked as boolean)}
                  aria-labelledby="acceptMarketingLabel-enhanced"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="acceptMarketing-enhanced" id="acceptMarketingLabel-enhanced" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    I want to receive updates and marketing communications
                  </Label>
                  <p className="text-xs text-muted-foreground">You can unsubscribe at any time</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        {/* Navigation Buttons */}
        <div className="flex w-full justify-between">
          {currentStep > 1 ? (
            <Button variant="outline" onClick={handleBack} disabled={isLoading}>
              Back
            </Button>
          ) : <div />} {/* Placeholder to keep Next/Submit button to the right */}
          
          <div>
            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="gap-2" disabled={isLoading || (currentStep === 2 && isCheckingUsername)}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || isCheckingUsername}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Sign In Link */}
        <div className="text-center pt-4 border-t w-full">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button variant="link" className="p-0 h-auto text-primary" onClick={onSwitchToSignIn} disabled={isLoading}>
              Sign in here
            </Button>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default EnhancedSignupForm;
