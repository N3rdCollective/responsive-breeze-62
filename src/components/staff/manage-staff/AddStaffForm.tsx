
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddStaffFormProps {
  onStaffAdded: () => void;
}

const AddStaffForm = ({ onStaffAdded }: AddStaffFormProps) => {
  const [newEmail, setNewEmail] = useState("");
  const [isAddingStaff, setIsAddingStaff] = useState(false);
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
      
      // In a real implementation, this would invite the user via email
      // For now, we'll just add them to the staff table
      const { error } = await supabase
        .from("staff")
        .insert({ 
          id: tempId,
          email: newEmail,
          role: "staff"
        });
      
      if (error) throw error;
      
      toast({
        title: "Staff Added",
        description: `${newEmail} has been added to the staff.`,
      });
      
      setNewEmail("");
      onStaffAdded();
    } catch (error) {
      console.error("Error adding staff:", error);
      toast({
        title: "Error",
        description: "Failed to add staff member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingStaff(false);
    }
  };

  return (
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
  );
};

export default AddStaffForm;
