
export interface FormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  acceptMarketing: boolean;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
}

export interface ValidationErrors {
  email?: string;
  username?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  acceptTerms?: string;
  apiError?: string;
}

export interface EnhancedSignupFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}
