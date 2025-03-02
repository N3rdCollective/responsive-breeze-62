import React from "react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { PendingStaff } from "../types/pendingStaffTypes";

interface PendingStaffRowProps {
  pending: PendingStaff;
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
        {canManageStaff ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onApproveReject(pending.id, true)}
              disabled={isProcessing}
            >
              {isProcessing ? "Approving..." : "Approve"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => onApproveReject(pending.id, false)}
              disabled={isProcessing}
            >
              {isProcessing ? "Rejecting..." : "Reject"}
            </Button>
          </>
        ) : (
          <span className="text-sm text-gray-500 italic px-2">No permission</span>
        )}
      </td>
    </tr>
  );
};

export default PendingStaffRow;
