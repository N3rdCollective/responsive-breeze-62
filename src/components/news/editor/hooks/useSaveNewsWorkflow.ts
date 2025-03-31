
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { NewsStatus } from "../NewsForm";
import { useNewsActivityLogging, NewsActivityLogData } from "./useNewsActivityLogging";

interface UseSaveNewsWorkflowProps {
  staffName: string;
}

export const useSaveNewsWorkflow = ({ staffName }: UseSaveNewsWorkflowProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logNewsActivity } = useNewsActivityLogging();

  const executeSaveWorkflow = async (
    saveFunction: () => Promise<{ id: string } | undefined>,
    data: {
      id?: string;
      title: string;
      status: NewsStatus;
      category?: string;
      hasImage: boolean;
    }
  ) => {
    try {
      console.log("[useSaveNewsWorkflow] Starting save workflow");
      
      // Attempt to save the post
      const saveResult = await saveFunction();
      
      // Extract the returned ID from the saveResult
      const resultId = saveResult?.id || data.id;
      
      if (!resultId) {
        console.error("[useSaveNewsWorkflow] No post ID found after save operation");
        return;
      }
      
      // Log the activity after successful save
      const actionType = data.id ? 'update_post' : 'create_post';
      const isPublishing = data.status === 'published';
      
      // If we're updating and publishing, log a publish action instead
      const finalActionType = data.id && isPublishing ? 'publish_post' : actionType;
      
      await logNewsActivity(
        finalActionType as any,
        {
          id: resultId,
          title: data.title,
          category: data.category,
          status: data.status,
          hasImage: data.hasImage
        }
      );
      
      console.log("[useSaveNewsWorkflow] Post saved and activity logged");
      
      // Return the post ID for further processing if needed
      return { id: resultId };
      
    } catch (error) {
      console.error("[useSaveNewsWorkflow] Error in save workflow:", error);
      toast({
        title: "Error",
        description: `Failed to complete save workflow: ${(error as Error)?.message || "Unknown error"}`,
        variant: "destructive",
      });
    }
  };
  
  return {
    executeSaveWorkflow
  };
};
