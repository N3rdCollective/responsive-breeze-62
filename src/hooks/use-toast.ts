
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
  
  // Only add properties that Sonner supports
  if (props.title) sonnerProps.title = props.title;
  if (props.variant === "destructive") sonnerProps.style = { backgroundColor: "var(--destructive)", color: "var(--destructive-foreground)" };
  if (props.variant === "success") sonnerProps.style = { backgroundColor: "var(--success)", color: "var(--success-foreground)" };
  
  return sonnerToast(props.description || "", sonnerProps);
};

// Add additional methods
const enhancedToast = Object.assign(toast, {
  success: (props: ToastProps) => {
    const sonnerProps: ExternalToast = {};
    if (props.title) sonnerProps.title = props.title;
    return sonnerToast.success(props.description || "", sonnerProps);
  },
  error: (props: ToastProps) => {
    const sonnerProps: ExternalToast = {};
    if (props.title) sonnerProps.title = props.title;
    return sonnerToast.error(props.description || "", sonnerProps);
  },
  warning: (props: ToastProps) => {
    const sonnerProps: ExternalToast = {};
    if (props.title) sonnerProps.title = props.title;
    return sonnerToast.warning(props.description || "", sonnerProps);
  },
  info: (props: ToastProps) => {
    const sonnerProps: ExternalToast = {};
    if (props.title) sonnerProps.title = props.title;
    return sonnerToast.info(props.description || "", sonnerProps);
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
