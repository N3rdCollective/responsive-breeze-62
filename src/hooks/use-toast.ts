
import { toast as sonnerToast } from "sonner";
import { type ToastProps as SonnerToastProps } from "sonner";

// Define a proper interface for our toast function calls
export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  // Add any other properties that might be needed
}

// Create a wrapper function to adapt our interface to Sonner's interface
const toast = (props: ToastProps) => {
  return sonnerToast(props.description || "", {
    // Map our properties to Sonner's expected properties
    title: props.title,
    variant: props.variant,
  });
};

// Add success, error, etc. methods to match Sonner's API
const enhancedToast = Object.assign(toast, {
  // Add additional methods from sonnerToast if needed
  success: (props: ToastProps) => sonnerToast.success(props.description || "", { title: props.title }),
  error: (props: ToastProps) => sonnerToast.error(props.description || "", { title: props.title }),
  warning: (props: ToastProps) => sonnerToast.warning(props.description || "", { title: props.title }),
  info: (props: ToastProps) => sonnerToast.info(props.description || "", { title: props.title }),
});

// Export the enhanced toast function
export { enhancedToast as toast };

// Wrap toast in a hook for consistent access
export function useToast() {
  return {
    toast: enhancedToast,
  };
}
