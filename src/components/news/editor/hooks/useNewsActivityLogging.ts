
import { useUnifiedActivityLogger } from "@/hooks/useUnifiedActivityLogger";

export interface NewsActivityLogData {
  id: string;
  title: string;
  category?: string;
  status: string;
  hasImage: boolean;
}

export const useNewsActivityLogging = () => {
  const { logNewsActivity } = useUnifiedActivityLogger();
  
  return { logNewsActivity };
};
