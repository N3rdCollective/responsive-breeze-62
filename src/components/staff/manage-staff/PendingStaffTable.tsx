
import React from "react";
import { usePendingStaff } from "./pending-staff/usePendingStaff";
import PendingStaffSkeleton from "./pending-staff/PendingStaffSkeleton";
import EmptyPendingState from "./pending-staff/EmptyPendingState";
import PendingStaffDataTable from "./pending-staff/PendingStaffTable";
import { PendingStaffTableProps } from "./types/pendingStaffTypes";

const PendingStaffTable = ({ onStaffUpdate, currentUserRole }: PendingStaffTableProps) => {
  const { 
    pendingStaff, 
    loading, 
    processingId, 
    handleApproveReject 
  } = usePendingStaff(onStaffUpdate);

  const canManageStaff = currentUserRole === "admin" || currentUserRole === "super_admin";

  if (loading) {
    return <PendingStaffSkeleton />;
  }

  if (pendingStaff.length === 0) {
    return <EmptyPendingState />;
  }

  return (
    <PendingStaffDataTable
      pendingStaff={pendingStaff}
      processingId={processingId}
      canManageStaff={canManageStaff}
      onApproveReject={(pendingId, approved) => 
        handleApproveReject(pendingId, approved, currentUserRole)
      }
    />
  );
};

export default PendingStaffTable;
