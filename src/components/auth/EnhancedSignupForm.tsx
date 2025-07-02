
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEmailCheck } from './EnhancedSignupForm/useEmailCheck';
import { useUsernameCheck } from './EnhancedSignupForm/useUsernameCheck';
import { validateSignupForm } from './EnhancedSignupForm/validation';
import type { SignupFormData, EnhancedSignupFormProps } from './EnhancedSignupForm/types';

export const EnhancedSignupForm: React.FC<EnhancedSignupFormProps> = ({ 
  onSuccess, 
  onSwitchToSignIn 
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    firstName: '',
    lastName: ''
  });

  const { emailExists, checkEmail } = useEmailCheck();
  const { usernameExists, checkUsername } = useUsernameCheck();

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Check email availability when email field changes
    if (field === 'email' && value && value.includes('@')) {
      checkEmail(value);
    }
    
    // Check username availability when username field changes
    if (field === 'username' && value.length >= 3) {
      checkUsername(value);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔥 Create Account button clicked!', { formData });
    setLoading(true);

    try {
      // Validate form
      console.log('🔍 Validating form...', { formData, emailExists, usernameExists });
      const validation = validateSignupForm(formData, emailExists, usernameExists);
      console.log('✅ Validation result:', validation);
      
      if (!validation.isValid) {
        console.log('❌ Validation failed:', validation.errors);
        toast({
          title: "Validation Error",
          description: validation.errors.join(', '),
          variant: "destructive",
        });
        return;
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: formData.username,
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      });

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        if (onSuccess) {
          onSuccess();
        } else {
          toast({
            title: "Account Created",
            description: "Welcome! Your account has been created successfully.",
          });
          navigate('/');
        }
      }
    } catch (error: any) {
      toast({
        title: "Signup Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            required
            className={usernameExists ? 'border-red-500' : ''}
          />
          {usernameExists && (
            <p className="text-sm text-red-500">Username already exists</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            className={emailExists ? 'border-red-500' : ''}
          />
          {emailExists && (
            <p className="text-sm text-red-500">Email already registered</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            required
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={loading || emailExists || usernameExists}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      {onSwitchToSignIn && (
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={onSwitchToSignIn}
            className="w-full"
          >
            Already have an account? Sign in
          </Button>
        </div>
      )}
    </div>
  );
};
