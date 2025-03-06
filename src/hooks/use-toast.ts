
import { toast as sonnerToast, type ToasterProps } from "sonner";

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
    // Sonner expects these properties differently
    title: props.title,
    // Map our variant to Sonner's expected properties if needed
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
