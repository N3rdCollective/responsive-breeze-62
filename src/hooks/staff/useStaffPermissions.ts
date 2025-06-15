
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StaffPermissions {
  isStaff: boolean;
  role: string | null;
  permissions: string[];
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  validateAction: (actionType: string, resourceType?: string, targetId?: string) => Promise<boolean>;
}

export const useStaffPermissions = (): StaffPermissions => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<StaffPermissions>({
    isStaff: false,
    role: null,
    permissions: [],
    loading: true,
    hasPermission: () => false,
    validateAction: async () => false,
  });

  useEffect(() => {
    const checkStaffPermissions = async () => {
      if (!user) {
        setPermissions({
          isStaff: false,
          role: null,
          permissions: [],
          loading: false,
          hasPermission: () => false,
          validateAction: async () => false,
        });
        return;
      }

      try {
        console.log('🔐 Checking staff permissions for user:', user.id);

        // Use the new non-recursive function to check if user is staff
        const { data: isStaffResult, error: staffCheckError } = await supabase
          .rpc('is_user_staff_member', { user_id: user.id });

        if (staffCheckError) {
          console.error('Error checking staff status:', staffCheckError);
          throw staffCheckError;
        }

        const isStaff = isStaffResult || false;
        console.log('🔐 User is staff:', isStaff);

        if (!isStaff) {
          setPermissions({
            isStaff: false,
            role: null,
            permissions: [],
            loading: false,
            hasPermission: () => false,
            validateAction: async () => false,
          });
          return;
        }

        // Get user's staff role using the new function
        const { data: roleResult, error: roleError } = await supabase
          .rpc('get_user_staff_role', { user_id: user.id });

        if (roleError) {
          console.error('Error fetching staff role:', roleError);
          throw roleError;
        }

        const role = roleResult || null;
        console.log('🔐 Staff role:', role);

        // Fetch permissions for this role
        let userPermissions: string[] = [];
        if (role) {
          const { data: permissionsData, error: permissionsError } = await supabase
            .from('role_permissions')
            .select(`
              staff_permissions (
                permission_name
              )
            `)
            .eq('role', role);

          if (permissionsError) {
            console.error('Error fetching permissions:', permissionsError);
          } else {
            userPermissions = permissionsData
              ?.map(rp => (rp as any).staff_permissions?.permission_name)
              .filter(Boolean) || [];
          }
        }

        console.log('🔐 User permissions:', userPermissions);

        const hasPermission = (permission: string): boolean => {
          return userPermissions.includes(permission);
        };

        const validateAction = async (
          actionType: string,
          resourceType?: string,
          targetId?: string
        ): Promise<boolean> => {
          try {
            console.log('🔐 Validating action:', { actionType, resourceType, targetId });

            const { data: result, error } = await supabase
              .rpc('validate_staff_action', {
                staff_id: user.id,
                action_type: actionType,
                resource_type: resourceType || null,
                target_id: targetId || null
              });

            if (error) {
              console.error('Error validating staff action:', error);
              return false;
            }

            console.log('🔐 Action validation result:', result);
            return result || false;
          } catch (err) {
            console.error('Error in validateAction:', err);
            return false;
          }
        };

        setPermissions({
          isStaff,
          role,
          permissions: userPermissions,
          loading: false,
          hasPermission,
          validateAction,
        });

      } catch (err: any) {
        console.error('Error in staff permissions check:', err);
        setPermissions({
          isStaff: false,
          role: null,
          permissions: [],
          loading: false,
          hasPermission: () => false,
          validateAction: async () => false,
        });
      }
    };

    checkStaffPermissions();
  }, [user]);

  return permissions;
};
