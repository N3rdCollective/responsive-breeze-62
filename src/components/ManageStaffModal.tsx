
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import useStaffManagement from "./staff/manage-staff/useStaffManagement";
import AddStaffForm from "./staff/manage-staff/AddStaffForm";
import StaffTable from "./staff/manage-staff/StaffTable";
import PendingStaffTable from "./staff/manage-staff/PendingStaffTable";
import StaffSectionHeader from "./staff/manage-staff/StaffSectionHeader";
import { StaffMember } from "./staff/manage-staff/types/pendingStaffTypes";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface ManageStaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole: string;
}

const ManageStaffModal = ({ open, onOpenChange, currentUserRole }: ManageStaffModalProps) => {
  const { staffMembers, loading, fetchStaffMembers, error } = useStaffManagement(open);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      console.log("ManageStaffModal: Modal opened with role:", currentUserRole);
    }
  }, [open, currentUserRole]);

  useEffect(() => {
    if (error) {
      console.error("ManageStaffModal: Error fetching staff:", error);
      toast({
        title: "Error",
        description: "Failed to load staff data. Please try again or contact support.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] md:max-w-[800px] w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-black dark:text-[#FFD700]">
            Manage Staff
          </DialogTitle>
          <DialogDescription>
            Staff management portal
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <StaffSectionHeader title="Invite New Staff" />
          
          <AddStaffForm 
            onStaffAdded={fetchStaffMembers} 
            currentUserRole={currentUserRole}
          />
          
          <StaffSectionHeader title="Pending Invitations" />
          
          <PendingStaffTable
            onStaffUpdate={fetchStaffMembers}
            currentUserRole={currentUserRole}
          />
          
          <StaffSectionHeader title="Active Staff Members" />
          
          <StaffTable
            staffMembers={staffMembers}
            loading={loading}
            onStaffUpdate={fetchStaffMembers}
            currentUserRole={currentUserRole}
          />
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
