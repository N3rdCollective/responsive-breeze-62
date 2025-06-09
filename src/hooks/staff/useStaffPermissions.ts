
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StaffPermissions {
  isStaff: boolean;
  role: string | null;
  permissions: string[];
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  validateAction: (actionType: string, resourceType?: string, targetId?: string) => Promise<boolean>;
}

export const useStaffPermissions = (): StaffPermissions => {
  const [state, setState] = useState<{
    isStaff: boolean;
    role: string | null;
    permissions: string[];
    loading: boolean;
  }>({
    isStaff: false,
    role: null,
    permissions: [],
    loading: true,
  });
  
  const { toast } = useToast();

  // Load staff permissions from server
  const loadPermissions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setState({
          isStaff: false,
          role: null,
          permissions: [],
          loading: false,
        });
        return;
      }

      // Get staff member details
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('role')
        .eq('id', user.id)
        .single();

      if (staffError || !staffData) {
        setState({
          isStaff: false,
          role: null,
          permissions: [],
          loading: false,
        });
        return;
      }

      // Get permissions for this role
      const { data: rolePermissions, error: permissionsError } = await supabase
        .from('role_permissions')
        .select(`
          staff_permissions (
            permission_name
          )
        `)
        .eq('role', staffData.role);

      if (permissionsError) {
        console.error('Error fetching role permissions:', permissionsError);
        setState({
          isStaff: true,
          role: staffData.role,
          permissions: [],
          loading: false,
        });
        return;
      }

      // Extract permissions from the nested data
      const permissions = rolePermissions
        ?.map((rp: any) => rp.staff_permissions?.permission_name)
        ?.filter(Boolean) || [];

      setState({
        isStaff: true,
        role: staffData.role,
        permissions,
        loading: false,
      });

    } catch (error) {
      console.error('Error loading staff permissions:', error);
      setState({
        isStaff: false,
        role: null,
        permissions: [],
        loading: false,
      });
    }
  }, []);

  // Check if staff has a specific permission (client-side cache check)
  const hasPermission = useCallback((permission: string): boolean => {
    return state.permissions.includes(permission);
  }, [state.permissions]);

  // Validate action server-side (secure validation)
  const validateAction = useCallback(async (
    actionType: string, 
    resourceType?: string, 
    targetId?: string
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Call the server-side validation function
      const { data, error } = await supabase.rpc('validate_staff_action', {
        staff_id: user.id,
        action_type: actionType,
        resource_type: resourceType,
        target_id: targetId
      });

      if (error) {
        console.error('Permission validation error:', error);
        toast({
          title: "Permission Error",
          description: "Failed to validate permissions. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      if (!data) {
        toast({
          title: "Access Denied",
          description: `You don't have permission to ${actionType} ${resourceType || 'this resource'}.`,
          variant: "destructive"
        });
      }

      return Boolean(data);
    } catch (error) {
      console.error('Error validating action:', error);
      toast({
        title: "Permission Error",
        description: "Failed to validate permissions. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  useEffect(() => {
    loadPermissions();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadPermissions();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadPermissions]);

  return {
    ...state,
    hasPermission,
    validateAction,
  };
};
