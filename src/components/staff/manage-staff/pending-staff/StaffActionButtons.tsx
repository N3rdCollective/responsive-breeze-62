
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface StaffActionButtonsProps {
  staffId: string;
  status: 'invited' | 'approved' | 'rejected';
  processingId: string | null;
  canManageStaff: boolean;
  onApproveReject: (pendingId: string, approved: boolean) => Promise<void>;
}

const StaffActionButtons: React.FC<StaffActionButtonsProps> = ({ 
  staffId, 
  status, 
  processingId, 
  canManageStaff,
  onApproveReject 
}) => {
  if (status !== 'invited' || !canManageStaff) {
    return (
      <span className="text-sm text-gray-500">
        {status === 'approved' ? 'Approved' : 
         status === 'rejected' ? 'Rejected' : 
         'Awaiting approval'}
      </span>
    );
  }

  return (
    <div className="flex space-x-2">
      <Button
        size="sm"
        variant="outline"
        className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
        onClick={() => onApproveReject(staffId, true)}
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
  );
};

export default StaffActionButtons;
