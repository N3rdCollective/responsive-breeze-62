
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

  const canAddStaff = currentUserRole === "admin" || currentUserRole === "super_admin";

  const handleAddStaff = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!canAddStaff) {
      setError("You don't have permission to add staff members. Only admins and super admins can add staff.");
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

      // Default role for new staff is "staff"
      const defaultRole = "staff";
      
      // Insert the new staff member
      const { error: insertError } = await supabase
        .from("staff")
        .insert({ 
          id: tempId,
          email: newEmail,
          role: defaultRole
        });
      
      if (insertError) {
        console.error("Error adding staff:", insertError);
        
        if (insertError.code === "42501") {
          setError("Permission denied. Your role may have changed or RLS policies are preventing this action.");
        } else {
          setError(`Failed to add staff member: ${insertError.message}`);
        }
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
          disabled={isAddingStaff || !canAddStaff}
        />
        <Button 
          onClick={handleAddStaff} 
          disabled={isAddingStaff || !canAddStaff}
        >
          {isAddingStaff ? "Adding..." : "Add Staff"}
        </Button>
      </div>
      
      {!canAddStaff && (
        <p className="text-sm text-gray-500">
          Only admins and super admins can add new staff members.
        </p>
      )}
    </div>
  );
};

export default AddStaffForm;
