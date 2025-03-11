
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface StaffActionButtonsProps {
  staffId: string;
  status: 'invited' | 'approved' | 'rejected' | 'requested';
  processingId: string | null;
  canManageStaff: boolean;
  onApproveReject: (pendingId: string, approved: boolean, role?: string) => Promise<void>;
}

const StaffActionButtons: React.FC<StaffActionButtonsProps> = ({ 
  staffId, 
  status, 
  processingId, 
  canManageStaff,
  onApproveReject 
}) => {
  const [selectedRole, setSelectedRole] = useState<string>("staff");
  
  // Only show action buttons for invited or requested statuses
  if ((status !== 'invited' && status !== 'requested') || !canManageStaff) {
    return (
      <span className="text-sm text-gray-500">
        {status === 'approved' ? 'Approved' : 
         status === 'rejected' ? 'Rejected' : 
         'Awaiting approval'}
      </span>
    );
  }

  const handleApprove = () => {
    onApproveReject(staffId, true, selectedRole);
  };

  return (
    <div className="flex flex-col space-y-2">
      <Select value={selectedRole} onValueChange={setSelectedRole}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="staff">Staff</SelectItem>
          <SelectItem value="moderator">Moderator</SelectItem>
          <SelectItem value="content_manager">Content Manager</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          onClick={handleApprove}
          disabled={processingId === staffId}
        >
          <CheckCircle className="h-4 w-4" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
          onClick={() => onApproveReject(staffId, false)}
          disabled={processingId === staffId}
        >
          <XCircle className="h-4 w-4" />
          Reject
        </Button>
      </div>
    </div>
  );
};

export default StaffActionButtons;
