
import { useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { NewsStatus } from "../NewsForm";

interface UseNewsPermissionsProps {
  userRole?: string;
}

export const useNewsPermissions = ({ userRole }: UseNewsPermissionsProps) => {
  const { toast } = useToast();
  
  // Check if user has permission to publish
  const canPublish = useMemo(() => {
    return userRole === 'admin' || userRole === 'super_admin' || 
           userRole === 'moderator' || userRole === 'content_manager';
  }, [userRole]);
  
  // Determine final status based on permissions
  const getFinalStatus = (requestedStatus: NewsStatus): NewsStatus => {
    // If trying to publish but doesn't have permission, save as draft
    const finalStatus = (requestedStatus === 'published' && !canPublish) ? 'draft' : requestedStatus;
    
    if (finalStatus !== requestedStatus) {
      toast({
        title: "Permission Required",
        description: "You don't have permission to publish posts. Saving as draft instead.",
        variant: "destructive",
      });
    }
    
    return finalStatus;
  };
  
  return {
    canPublish,
    getFinalStatus
  };
};
