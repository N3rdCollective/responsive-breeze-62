
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StaffMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string | null;
}

interface ManageStaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ManageStaffModal = ({ open, onOpenChange }: ManageStaffModalProps) => {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchStaffMembers();
    }
  }, [open]);

  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("staff").select("*");
      
      if (error) {
        throw error;
      }
      
      setStaffMembers(data || []);
    } catch (error) {
      console.error("Error fetching staff members:", error);
      toast({
        title: "Error",
        description: "Failed to load staff members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      
      // In a real implementation, this would invite the user via email
      // For now, we'll just add them to the staff table
      const { error } = await supabase
        .from("staff")
        .insert({ 
          email: newEmail,
          role: "staff"
        });
      
      if (error) throw error;
      
      toast({
        title: "Staff Added",
        description: `${newEmail} has been added to the staff.`,
      });
      
      setNewEmail("");
      fetchStaffMembers();
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

  const handleRemoveStaff = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} from staff?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from("staff")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast({
        title: "Staff Removed",
        description: `${email} has been removed from staff.`,
      });
      
      fetchStaffMembers();
    } catch (error) {
      console.error("Error removing staff:", error);
      toast({
        title: "Error",
        description: "Failed to remove staff member. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-black dark:text-[#FFD700]">
            Manage Staff
          </DialogTitle>
          <DialogDescription>
            Add or remove staff members who can access the control panel.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
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
          
          <div className="border rounded-md">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Loading staff members...</p>
              </div>
            ) : staffMembers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No staff members found.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2 pl-4">Email</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Role</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {staffMembers.map((staff) => (
                    <tr key={staff.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 pl-4">{staff.email}</td>
                      <td className="p-2">
                        {staff.first_name || staff.last_name 
                          ? `${staff.first_name || ''} ${staff.last_name || ''}`.trim() 
                          : '-'}
                      </td>
                      <td className="p-2 capitalize">{staff.role}</td>
                      <td className="p-2 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleRemoveStaff(staff.id, staff.email)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageStaffModal;
