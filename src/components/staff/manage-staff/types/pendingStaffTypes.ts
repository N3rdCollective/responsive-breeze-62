
export interface PendingStaffMember {
  id: string;
  email: string;
  status: 'invited' | 'approved' | 'rejected' | 'requested';
  invited_at: string;
  approved_at?: string | null;
  rejected_at?: string | null;
}

// Adding PendingStaff as an alias for backwards compatibility
export type PendingStaff = PendingStaffMember;

export interface PendingStaffTableProps {
  onStaffUpdate: () => void;
  currentUserRole: string;
}

export interface StaffMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  role: string;
  created_at: string | null;
}

export interface StaffSectionHeaderProps {
  title: string;
}

export interface StaffTableProps {
  staffMembers: StaffMember[];
  loading: boolean;
  onStaffUpdate: () => void;
  currentUserRole: string;
}

export interface StaffMemberRowProps {
  staff: StaffMember;
  onUpdate: () => void;
  currentUserRole: string;
}
