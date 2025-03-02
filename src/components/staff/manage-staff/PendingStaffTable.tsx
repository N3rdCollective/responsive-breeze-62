
import React, { useEffect } from "react";
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
    handleApproveReject,
    error,
    fetchPendingStaff
  } = usePendingStaff(onStaffUpdate);

  const canManageStaff = currentUserRole === "admin" || currentUserRole === "super_admin";

  useEffect(() => {
    console.log("PendingStaffTable: Rendered with role", currentUserRole);
    console.log("PendingStaffTable: Can manage staff?", canManageStaff);
    
    if (!canManageStaff) {
      console.log("PendingStaffTable: User doesn't have permission to manage staff");
    }
  }, [currentUserRole, canManageStaff]);

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
