import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useHRPermissions = () => {
  const { user, isStaff } = useAuth();

  const { data: hrPermissions, isLoading } = useQuery({
    queryKey: ["hrPermissions", user?.id],
    queryFn: async () => {
      if (!user?.id || !isStaff) {
        return { hasHRAccess: false, role: null };
      }

      const { data, error } = await supabase
        .from("staff")
        .select("hr_permissions, role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching HR permissions:", error);
        return { hasHRAccess: false, role: null };
      }

      return {
        hasHRAccess: data.hr_permissions || data.role === "super_admin",
        role: data.role,
      };
    },
    enabled: !!user?.id && isStaff,
  });

  return {
    hasHRAccess: hrPermissions?.hasHRAccess || false,
    role: hrPermissions?.role || null,
    isLoading,
  };
};