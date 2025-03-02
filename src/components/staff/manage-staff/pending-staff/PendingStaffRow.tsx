
import React from "react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { PendingStaffMember } from "../types/pendingStaffTypes";

interface PendingStaffRowProps {
  pending: PendingStaffMember;
  processingId: string | null;
  canManageStaff: boolean;
  onApproveReject: (pendingId: string, approved: boolean) => void;
}

const PendingStaffRow = ({ pending, processingId, canManageStaff, onApproveReject }: PendingStaffRowProps) => {
  const isProcessing = pending.id === processingId;

  // Get status display text and style
  const getStatusDisplay = () => {
    switch (pending.status) {
      case "approved":
        return <span className="text-green-600 dark:text-green-400 font-medium">Approved</span>;
      case "rejected":
        return <span className="text-red-600 dark:text-red-400 font-medium">Rejected</span>;
      case "requested":
        return <span className="text-blue-600 dark:text-blue-400 font-medium">Requested by user</span>;
      default:
        return <span className="text-yellow-600 dark:text-yellow-400 font-medium">Invited</span>;
    }
  };

  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="p-2 pl-4">{pending.email}</td>
      <td className="p-2">
        {getStatusDisplay()}
      </td>
      <td className="p-2">
        {formatDate(pending.invited_at)}
      </td>
      <td className="p-2 pr-4 whitespace-nowrap">
        {canManageStaff && (pending.status === 'invited' || pending.status === 'requested') ? (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              onClick={() => onApproveReject(pending.id, true)}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Approve"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              onClick={() => onApproveReject(pending.id, false)}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Reject"}
            </Button>
          </div>
        ) : (
          <span className="text-sm text-gray-500 italic px-2">
            {!canManageStaff ? "No permission" : (
              pending.status === 'approved' ? "Approved" : "Rejected"
            )}
          </span>
        )}
      </td>
    </tr>
  );
};

export default PendingStaffRow;
