
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AddStaffFormProps {
  onStaffAdded: () => void;
  currentUserRole: string;
}

const AddStaffForm = ({ onStaffAdded, currentUserRole }: AddStaffFormProps) => {
  const [newEmail, setNewEmail] = useState("");
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddStaff = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAddingStaff(true);
      setError(null);
      
      // Check if staff already exists
      const { data: existingStaff } = await supabase
        .from("staff")
        .select("*")
        .eq("email", newEmail)
        .single();
      
      if (existingStaff) {
        toast({
          title: "Staff Already Exists",
          description: `${newEmail} is already a staff member.`,
          variant: "destructive",
        });
        return;
      }
      
      // Generate a temporary ID for the new staff member
      const tempId = crypto.randomUUID();

      // Determine the default role based on current user's role
      // Super admins and admins can add staff, moderators can only add moderators
      let defaultRole = "staff";
      if (currentUserRole !== "super_admin" && currentUserRole !== "admin") {
        defaultRole = "moderator";
      }
      
      // Use service role or RPC function to bypass RLS
      // For now, we'll try to insert with the current user's session
      const { error } = await supabase
        .from("staff")
        .insert({ 
          id: tempId,
          email: newEmail,
          role: defaultRole
        });
      
      if (error) {
        console.error("Error adding staff:", error);
        setError("Failed to add staff member. You may not have permission to add new staff.");
        return;
      }
      
      toast({
        title: "Staff Added",
        description: `${newEmail} has been added to the staff.`,
      });
      
      setNewEmail("");
      onStaffAdded();
    } catch (error) {
      console.error("Error adding staff:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsAddingStaff(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex gap-2">
        <Input
          placeholder="staff@radiofm.com"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          disabled={isAddingStaff}
        />
        <Button 
          onClick={handleAddStaff} 
          disabled={isAddingStaff}
        >
          {isAddingStaff ? "Adding..." : "Add Staff"}
        </Button>
      </div>
    </div>
  );
};

export default AddStaffForm;
