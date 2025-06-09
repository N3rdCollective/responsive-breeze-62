
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useLogout = (staffName: string | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const logout = useCallback(async () => {
    try {
      console.log('Initiating staff logout...');
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during logout:', error);
        toast({
          title: "Logout Error",
          description: "There was an issue logging out. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Staff logout successful');
      
      // Show success message
      toast({
        title: "Logged Out",
        description: staffName ? `Goodbye, ${staffName}!` : "You have been logged out successfully.",
      });

      // Navigate to staff login page
      navigate('/staff/login', { replace: true });
      
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      toast({
        title: "Logout Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  }, [navigate, toast, staffName]);

  return logout;
};
