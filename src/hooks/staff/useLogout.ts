
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useLogout = (staffName: string) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const logout = useCallback(async (): Promise<void> => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Logout Error",
          description: "Failed to logout properly",
          variant: "destructive",
        });
        return;
      }

      // Show success message
      toast({
        title: "Logged Out",
        description: `Goodbye, ${staffName}!`,
      });

      // Redirect to login page
      navigate('/auth'); // Changed from /staff/login
      
    } catch (error) {
      console.error('Unexpected logout error:', error);
      toast({
        title: "Logout Error",
        description: "An unexpected error occurred during logout",
        variant: "destructive",
      });
    }
  }, [staffName, toast, navigate]); // Dependencies updated

  return logout; // Function name is logout
};
