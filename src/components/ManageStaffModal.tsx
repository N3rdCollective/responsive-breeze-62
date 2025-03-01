
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import useStaffManagement from "./staff/manage-staff/useStaffManagement";
import AddStaffForm from "./staff/manage-staff/AddStaffForm";
import StaffTable from "./staff/manage-staff/StaffTable";

interface ManageStaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole: string;
}

const ManageStaffModal = ({ open, onOpenChange, currentUserRole }: ManageStaffModalProps) => {
  const { staffMembers, loading, fetchStaffMembers } = useStaffManagement(open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] md:max-w-[800px] w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-black dark:text-[#FFD700]">
            Manage Staff
          </DialogTitle>
          <DialogDescription>
            Add or remove staff members who can access the control panel.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <AddStaffForm 
            onStaffAdded={fetchStaffMembers} 
            currentUserRole={currentUserRole}
          />
          
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
