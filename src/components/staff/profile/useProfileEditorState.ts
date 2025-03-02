
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePasswordSection } from "./usePasswordSection";

export const useProfileEditorState = (
  open: boolean,
  onOpenChange: (open: boolean) => void
) => {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the password section hook
  const {
    currentPassword,
    newPassword,
    confirmPassword,
    showPasswordSection,
    handleCurrentPasswordChange: setCurrentPassword,
    handleNewPasswordChange: setNewPassword,
    handleConfirmPasswordChange: setConfirmPassword,
    togglePasswordSection: togglePasswordSectionInternal,
    resetPasswordFields
  } = usePasswordSection();
  
  // For backward compatibility
  const setShowPasswordSection = (value: boolean) => {
    if (value !== showPasswordSection) {
      togglePasswordSectionInternal();
    }
  };
  
  useEffect(() => {
    if (open) {
      loadStaffProfile();
      // Reset password fields when reopening
      resetPasswordFields();
    }
  }, [open]);
  
  const loadStaffProfile = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data: staffData, error } = await supabase
        .from("staff")
        .select("*")
        .eq("id", session.user.id)
        .single();
        
      if (error) {
        throw error;
      }
      
      if (staffData) {
        // Use display_name if available, otherwise fallback to first_name and last_name
        if (staffData.display_name) {
          setDisplayName(staffData.display_name);
        } else {
          // Combine first_name and last_name into display_name if they exist
          let name = "";
          if (staffData.first_name) name += staffData.first_name;
          if (staffData.first_name && staffData.last_name) name += " ";
          if (staffData.last_name) name += staffData.last_name;
          
          setDisplayName(name);
        }
        setEmail(staffData.email || "");
      }
    } catch (error) {
      console.error("Error loading staff profile:", error);
      toast({
        title: "Error loading profile",
        description: "Could not load your profile information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session");
      }
      
      // Update profile information
      const { error: profileError } = await supabase
        .from("staff")
        .update({
          display_name: displayName,
        })
        .eq("id", session.user.id);
        
      if (profileError) {
        throw profileError;
      }
      
      // Update password if section is shown and fields are filled
      if (showPasswordSection && currentPassword && newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("New passwords don't match");
        }
        
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        });
        
        if (passwordError) {
          throw passwordError;
        }
        
        toast({
          title: "Password Updated",
          description: "Your password has been updated successfully.",
        });
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: error.message || "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    displayName,
    setDisplayName,
    email,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPasswordSection,
    setShowPasswordSection,
    isLoading,
    handleSaveProfile
  };
};
