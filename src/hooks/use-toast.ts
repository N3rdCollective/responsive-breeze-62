
import { toast as sonnerToast, type ToasterProps, ExternalToast } from "sonner";

// Define our custom toast interface
export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  // Add any other properties that might be needed
}

// Create a wrapper function to adapt our interface to Sonner's interface
const toast = (props: ToastProps) => {
  // Create a compatible object for Sonner
  const sonnerProps: ExternalToast = {};
  
  // Apply styling based on variant
  if (props.variant === "destructive") sonnerProps.style = { backgroundColor: "var(--destructive)", color: "var(--destructive-foreground)" };
  if (props.variant === "success") sonnerProps.style = { backgroundColor: "var(--success)", color: "var(--success-foreground)" };
  
  // Sonner takes title as the first parameter and description in options for some methods
  // For the default toast, title is passed as an option in the second parameter
  return sonnerToast(props.description || "", {
    ...sonnerProps,
    // @ts-ignore - Sonner does accept title but TypeScript definition might be outdated
    title: props.title
  });
};

// Add additional methods
const enhancedToast = Object.assign(toast, {
  success: (props: ToastProps) => {
    const sonnerProps: ExternalToast = {};
    return sonnerToast.success(props.description || "", {
      ...sonnerProps,
      // @ts-ignore - Sonner does accept title but TypeScript definition might be outdated
      title: props.title
    });
  },
  error: (props: ToastProps) => {
    const sonnerProps: ExternalToast = {};
    return sonnerToast.error(props.description || "", {
      ...sonnerProps,
      // @ts-ignore - Sonner does accept title but TypeScript definition might be outdated
      title: props.title
    });
  },
  warning: (props: ToastProps) => {
    const sonnerProps: ExternalToast = {};
    return sonnerToast.warning(props.description || "", {
      ...sonnerProps,
      // @ts-ignore - Sonner does accept title but TypeScript definition might be outdated
      title: props.title
    });
  },
  info: (props: ToastProps) => {
    const sonnerProps: ExternalToast = {};
    return sonnerToast.info(props.description || "", {
      ...sonnerProps,
      // @ts-ignore - Sonner does accept title but TypeScript definition might be outdated
      title: props.title
    });
  },
});

// Export the enhanced toast function
export { enhancedToast as toast };

// Wrap toast in a hook for consistent access
export function useToast() {
  return {
    toast: enhancedToast,
  };
}
