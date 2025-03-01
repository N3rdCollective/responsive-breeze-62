
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
import { UserCog } from "lucide-react";

interface StaffProfileEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StaffProfileEditor = ({ open, onOpenChange }: StaffProfileEditorProps) => {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (open) {
      loadStaffProfile();
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
        setFirstName(staffData.first_name || "");
        setLastName(staffData.last_name || "");
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
      
      const { error } = await supabase
        .from("staff")
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq("id", session.user.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
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
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Your first name"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Your last name"
                disabled={isLoading}
              />
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
