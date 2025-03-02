
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import useStaffManagement from "./staff/manage-staff/useStaffManagement";
import AddStaffForm from "./staff/manage-staff/AddStaffForm";
import StaffTable from "./staff/manage-staff/StaffTable";
import PendingStaffTable from "./staff/manage-staff/PendingStaffTable";
import StaffSectionHeader from "./staff/manage-staff/StaffSectionHeader";
import AutoFillDemoLink from "./staff/manage-staff/AutoFillDemoLink";

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
            <AutoFillDemoLink />
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
