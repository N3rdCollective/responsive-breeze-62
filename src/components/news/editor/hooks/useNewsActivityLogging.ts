
import { useStaffActivityLogger } from "@/hooks/useStaffActivityLogger";

export interface NewsActivityLogData {
  id: string;
  title: string;
  category?: string;
  status: string;
  hasImage: boolean;
}

export const useNewsActivityLogging = () => {
  const { logActivity } = useStaffActivityLogger();
  
  const logNewsActivity = async (
    action: 'create_post' | 'update_post' | 'publish_post',
    data: NewsActivityLogData
  ) => {
    const { id, title, category, status, hasImage } = data;
    
    // Determine description based on action
    let description = '';
    if (action === 'create_post') {
      description = `Created new post: ${title}`;
    } else if (action === 'update_post') {
      description = `Updated post: ${title}`;
    } else if (action === 'publish_post') {
      description = `Published post: ${title}`;
    }
    
    await logActivity(
      action,
      description,
      'post',
      id,
      {
        title,
        category,
        status,
        hasImage
      }
    );
    
    console.log("[useNewsActivityLogging] Activity logged:", {
      action,
      description,
      entityType: 'post',
      entityId: id
    });
  };
  
  return { logNewsActivity };
};
