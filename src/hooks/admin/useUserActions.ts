
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUserActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updateUserStatus = async (userId: string, status: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User status updated to ${status}`,
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setIsLoading(true);
    try {
      // Soft-delete: mark the user as deactivated instead of calling admin API from the client
      const result = await updateUserStatus(userId, 'deactivated');
      if (!result?.success) {
        throw new Error('Failed to mark user as deactivated');
      }

      toast({
        title: "User marked for deactivation",
        description: "An administrator can complete deletion securely via the backend.",
      });

      return { success: true, softDeleted: true };
    } catch (error) {
      console.error('Error soft-deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateUserStatus,
    deleteUser,
    isLoading
  };
};
