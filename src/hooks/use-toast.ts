
import { toast } from "sonner";

// Re-export toast function
export { toast };

// Export type definitions to ensure consistent use across the application
export type ToastProps = {
  description?: string;
  variant?: "default" | "destructive" | "success";
};

// Wrap toast in a hook for consistent access
export function useToast() {
  return {
    toast,
  };
}
