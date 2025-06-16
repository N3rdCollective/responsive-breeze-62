
export const calculatePasswordStrength = (password: string) => {
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

export const validateEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return '';
};

export const validateUsername = (username: string): string => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 20) return 'Username must be less than 20 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores';
  return '';
};

export const validatePassword = (password: string, passwordStrength: number): string => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (passwordStrength < 3 && password.length > 0) return 'Password is too weak. Include uppercase, lowercase, numbers, and special characters.';
  return '';
};

export const getPasswordStrengthColor = (strength: number): string => {
  if (strength <= 1) return 'bg-red-500';
  if (strength <= 2) return 'bg-yellow-500';
  if (strength <= 3) return 'bg-blue-500';
  return 'bg-green-500';
};

export const getPasswordStrengthText = (strength: number): string => {
  if (strength <= 1) return 'Very Weak';
  if (strength <= 2) return 'Weak';
  if (strength <= 3) return 'Fair';
  if (strength <= 4) return 'Good';
  return 'Strong';
};

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  firstName: string;
  lastName: string;
}

export const validateSignupForm = (
  formData: SignupFormData, 
  emailExists: boolean, 
  usernameExists: boolean
) => {
  const errors: string[] = [];

  // Validate email
  const emailError = validateEmail(formData.email);
  if (emailError) errors.push(emailError);
  if (emailExists) errors.push('Email already exists');

  // Validate username
  const usernameError = validateUsername(formData.username);
  if (usernameError) errors.push(usernameError);
  if (usernameExists) errors.push('Username already exists');

  // Validate password
  const { strength } = calculatePasswordStrength(formData.password);
  const passwordError = validatePassword(formData.password, strength);
  if (passwordError) errors.push(passwordError);

  // Validate password confirmation
  if (formData.password !== formData.confirmPassword) {
    errors.push('Passwords do not match');
  }

  // Validate required fields
  if (!formData.firstName.trim()) errors.push('First name is required');
  if (!formData.lastName.trim()) errors.push('Last name is required');

  return {
    isValid: errors.length === 0,
    errors
  };
};
