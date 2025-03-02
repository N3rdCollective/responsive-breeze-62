
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import useStaffManagement from "./staff/manage-staff/useStaffManagement";
import AddStaffForm from "./staff/manage-staff/AddStaffForm";
import StaffTable from "./staff/manage-staff/StaffTable";
import PendingStaffTable from "./staff/manage-staff/PendingStaffTable";

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
            <a href="#" className="text-blue-500 hover:underline ml-2" onClick={(e) => {
              e.preventDefault();
              const emailInput = document.querySelector('input[placeholder="staff@radiofm.com"]') as HTMLInputElement;
              if (emailInput) {
                emailInput.value = `demo-staff-${Math.floor(Math.random() * 1000)}@radiofm.com`;
                emailInput.focus();
              }
            }}>
              Demo: Auto-fill with random email
            </a>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <AddStaffForm 
            onStaffAdded={fetchStaffMembers} 
            currentUserRole={currentUserRole}
          />
          
          <PendingStaffTable
            onStaffUpdate={fetchStaffMembers}
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
