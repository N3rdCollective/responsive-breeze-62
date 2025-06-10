import { useState, useEffect, useCallback, useRef } from 'react';
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
  const loadingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  // Load staff permissions from server with debouncing
  const loadPermissions = useCallback(async () => {
    // Prevent concurrent loading
    if (loadingRef.current) {
      console.log('🔄 Permission loading already in progress, skipping...');
      return;
    }

    console.log('🔍 Loading staff permissions...');
    loadingRef.current = true;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ No authenticated user found');
        setState({
          isStaff: false,
          role: null,
          permissions: [],
          loading: false,
        });
        lastUserIdRef.current = null;
        return;
      }

      // Skip if we already loaded permissions for this user
      if (lastUserIdRef.current === user.id && state.loading === false) {
        console.log('✅ Permissions already loaded for user:', user.id);
        loadingRef.current = false;
        return;
      }

      console.log('✅ Authenticated user found:', user.id);
      lastUserIdRef.current = user.id;

      // Get staff member details
      console.log('🔍 Fetching staff data...');
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('role')
        .eq('id', user.id)
        .single();

      if (staffError) {
        console.log('❌ Staff query error:', staffError);
        if (staffError.code === 'PGRST116') {
          console.log('❌ User is not a staff member');
        } else {
          console.error('❌ Unexpected staff query error:', staffError);
        }
        setState({
          isStaff: false,
          role: null,
          permissions: [],
          loading: false,
        });
        return;
      }

      if (!staffData) {
        console.log('❌ No staff data returned');
        setState({
          isStaff: false,
          role: null,
          permissions: [],
          loading: false,
        });
        return;
      }

      console.log('✅ Staff data found:', staffData);

      // Get permissions for this role
      console.log('🔍 Fetching role permissions...');
      const { data: rolePermissions, error: permissionsError } = await supabase
        .from('role_permissions')
        .select(`
          staff_permissions (
            permission_name
          )
        `)
        .eq('role', staffData.role);

      if (permissionsError) {
        console.error('⚠️ Error fetching role permissions:', permissionsError);
        // Continue even if permissions fail - user is still staff
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

      console.log('✅ Staff permissions loaded successfully:', {
        role: staffData.role,
        permissions,
        isStaff: true
      });

      setState({
        isStaff: true,
        role: staffData.role,
        permissions,
        loading: false,
      });

    } catch (error) {
      console.error('❌ Error loading staff permissions:', error);
      setState({
        isStaff: false,
        role: null,
        permissions: [],
        loading: false,
      });
    } finally {
      loadingRef.current = false;
    }
  }, [state.loading]);

  // Check if staff has a specific permission (client-side cache check)
  const hasPermission = useCallback((permission: string): boolean => {
    const result = state.permissions.includes(permission);
    console.log(`🔐 Permission check: ${permission} = ${result}`);
    return result;
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
        console.error('❌ No authenticated user for permission validation');
        throw new Error('Not authenticated');
      }

      console.log(`🔐 Validating action: actionType="${actionType}", resourceType="${resourceType}", targetId="${targetId}"`);

      // Call the server-side validation function with correct parameters
      const { data, error } = await supabase.rpc('validate_staff_action', {
        staff_id: user.id,
        action_type: actionType,
        resource_type: resourceType || null,
        target_id: targetId || null
      });

      if (error) {
        console.error('❌ Permission validation error:', error);
        toast({
          title: "Permission Error",
          description: "Failed to validate permissions. Please try again.",
          variant: "destructive"
        });
        return false;
      }

      console.log(`🔐 Permission validation result: ${data}`);

      if (!data) {
        console.warn(`❌ Permission denied: ${actionType} on ${resourceType}`);
        toast({
          title: "Access Denied",
          description: `You don't have permission to ${actionType} ${resourceType || 'this resource'}.`,
          variant: "destructive"
        });
      }

      return Boolean(data);
    } catch (error) {
      console.error('❌ Error validating action:', error);
      toast({
        title: "Permission Error",
        description: "Failed to validate permissions. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  useEffect(() => {
    let mounted = true;
    
    const initializePermissions = async () => {
      if (mounted) {
        await loadPermissions();
      }
    };

    initializePermissions();

    // Listen for auth changes with debouncing
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Small delay to ensure RLS context is ready and prevent rapid successive calls
        setTimeout(async () => {
          if (mounted) {
            await loadPermissions();
          }
        }, 200);
      } else if (event === 'SIGNED_OUT') {
        setState({
          isStaff: false,
          role: null,
          permissions: [],
          loading: false,
        });
        lastUserIdRef.current = null;
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    ...state,
    hasPermission,
    validateAction,
  };
};
