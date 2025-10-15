
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import useStaffManagement from "./staff/manage-staff/useStaffManagement";
import StaffTable from "./staff/manage-staff/StaffTable";
import PendingStaffTable from "./staff/manage-staff/PendingStaffTable";
import StaffSectionHeader from "./staff/manage-staff/StaffSectionHeader";
import { AddStaffMemberDialog } from "./staff/manage-staff/AddStaffMemberDialog";
import { UserPlus } from "lucide-react";

interface ManageStaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole: string;
}

const ManageStaffModal = ({ open, onOpenChange, currentUserRole }: ManageStaffModalProps) => {
  const { staffMembers, loading, fetchStaffMembers } = useStaffManagement(open);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const canAddStaff = currentUserRole === "admin" || currentUserRole === "super_admin";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] md:max-w-[800px] w-[90vw]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold text-black dark:text-[#FFD700]">
                  Manage Staff
                </DialogTitle>
                <DialogDescription>
                  Staff management portal
                </DialogDescription>
              </div>
              {canAddStaff && (
                <Button onClick={() => setShowAddDialog(true)} size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              )}
            </div>
          </DialogHeader>
        
        <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
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

      <AddStaffMemberDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={fetchStaffMembers}
        currentUserRole={currentUserRole}
      />
    </>
  );
};

export default ManageStaffModal;
