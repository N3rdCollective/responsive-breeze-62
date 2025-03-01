
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserCog, Lock } from "lucide-react";

interface StaffProfileEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StaffProfileEditor = ({ open, onOpenChange }: StaffProfileEditorProps) => {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (open) {
      loadStaffProfile();
      // Reset password fields and visibility when reopening
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
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
        // Combine first_name and last_name into display_name if they exist
        let name = "";
        if (staffData.first_name) name += staffData.first_name;
        if (staffData.first_name && staffData.last_name) name += " ";
        if (staffData.last_name) name += staffData.last_name;
        
        setDisplayName(name);
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
      
      // Split display name into first and last name
      const nameParts = displayName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      
      // Update profile information
      const { error: profileError } = await supabase
        .from("staff")
        .update({
          first_name: firstName,
          last_name: lastName,
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
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" /> 
            Edit Profile
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                This is how your name will appear throughout the system.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={email}
                disabled={true}
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed as it's linked to your account.
              </p>
            </div>
            
            <div className="pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                disabled={isLoading}
              >
                <Lock className="h-4 w-4" />
                {showPasswordSection ? "Hide Password Section" : "Change Password"}
              </Button>
            </div>
            
            {showPasswordSection && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <SheetFooter className="flex space-x-2 sm:space-x-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveProfile}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default StaffProfileEditor;
