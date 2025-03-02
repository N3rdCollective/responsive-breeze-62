
export interface PendingStaffMember {
  id: string;
  email: string;
  status: 'invited' | 'approved' | 'rejected';
  invited_at: string;
  approved_at?: string | null;
  rejected_at?: string | null;
}

export interface PendingStaffTableProps {
  onStaffUpdate: () => void;
  currentUserRole: string;
}
