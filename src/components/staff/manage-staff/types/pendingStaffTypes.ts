
export interface PendingStaffMember {
  id: string;
  email: string;
  status: 'invited' | 'approved' | 'rejected' | 'requested';
  invited_at: string;
}

export interface StaffMember {
  id: string;
  email: string;
  role: string;
  display_name: string | null;
  created_at?: string;
}

export interface PendingStaffTableProps {
  onStaffUpdate: () => void;
  currentUserRole: string;
}
