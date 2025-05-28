
import { useUnifiedActivityLogger } from "@/hooks/useUnifiedActivityLogger";

export const useAuthActivityLogger = () => {
  const { logAuthActivity } = useUnifiedActivityLogger();
  return { logAuthActivity };
};
