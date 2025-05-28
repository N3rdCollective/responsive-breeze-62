
import { useUnifiedActivityLogger } from "./useUnifiedActivityLogger";

export const useStaffActivityLogger = () => {
  const { logActivity } = useUnifiedActivityLogger();
  return { logActivity };
};

// Add default export for backward compatibility
export default useStaffActivityLogger;
