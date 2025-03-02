
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

export interface StaffMember {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
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
