
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StaffPermissions {
  isStaff: boolean;
  role: string | null;
  canModerate: boolean;
  loading: boolean;
}

export const useStaffPermissions = (): StaffPermissions => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<StaffPermissions>({
    isStaff: false,
    role: null,
    canModerate: false,
    loading: true,
  });

  useEffect(() => {
    const checkStaffPermissions = async () => {
      if (!user) {
        setPermissions({
          isStaff: false,
          role: null,
          canModerate: false,
          loading: false,
        });
        return;
      }

      try {
        console.log('🔐 Forum: Checking staff permissions for user:', user.id);

        // Use the new non-recursive function to check if user is staff
        const { data: isStaffResult, error: staffCheckError } = await supabase
          .rpc('is_user_staff_member', { user_id: user.id });

        if (staffCheckError) {
          console.error('Forum: Error checking staff status:', staffCheckError);
          throw staffCheckError;
        }

        const isStaff = isStaffResult || false;
        console.log('🔐 Forum: User is staff:', isStaff);

        if (!isStaff) {
          setPermissions({
            isStaff: false,
            role: null,
            canModerate: false,
            loading: false,
          });
          return;
        }

        // Get user's staff role using the new function
        const { data: roleResult, error: roleError } = await supabase
          .rpc('get_user_staff_role', { user_id: user.id });

        if (roleError) {
          console.error('Forum: Error fetching staff role:', roleError);
          throw roleError;
        }

        const role = roleResult || null;
        const canModerate = role === 'admin' || role === 'super_admin' || role === 'moderator';

        console.log('🔐 Forum: Staff role:', role, 'Can moderate:', canModerate);

        setPermissions({
          isStaff,
          role,
          canModerate,
          loading: false,
        });

      } catch (err: any) {
        console.error('Forum: Error in staff permissions check:', err);
        setPermissions({
          isStaff: false,
          role: null,
          canModerate: false,
          loading: false,
        });
      }
    };

    checkStaffPermissions();
  }, [user]);

  return permissions;
};
