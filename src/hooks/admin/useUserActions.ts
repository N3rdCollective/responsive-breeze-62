
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
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
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
