
import { useUnifiedActivityLogger } from "./useUnifiedActivityLogger";

export const useStaffActivityLogger = () => {
  const { logActivity } = useUnifiedActivityLogger();
  return { logActivity };
};
