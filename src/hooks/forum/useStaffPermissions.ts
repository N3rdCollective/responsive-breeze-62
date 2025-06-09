
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
        const { data: staffData, error } = await supabase
          .from('staff')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking staff permissions:', error);
        }

        const role = staffData?.role || null;
        const isStaff = !!staffData;
        const canModerate = role === 'admin' || role === 'super_admin' || role === 'moderator';

        setPermissions({
          isStaff,
          role,
          canModerate,
          loading: false,
        });
      } catch (err) {
        console.error('Error in staff permissions check:', err);
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
