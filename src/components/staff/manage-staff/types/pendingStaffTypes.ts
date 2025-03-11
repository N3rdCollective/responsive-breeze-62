
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
  first_name?: string | null;
  last_name?: string | null;
  created_at?: string;
}

export interface PendingStaffTableProps {
  onStaffUpdate: () => void;
  currentUserRole: string;
}

export type StaffRole = 'admin' | 'super_admin' | 'moderator' | 'staff' | 'content_manager' | 'blogger';

export const ROLE_DISPLAY_NAMES: Record<StaffRole, string> = {
  'admin': 'Admin',
  'super_admin': 'Super Admin',
  'moderator': 'Moderator',
  'staff': 'Staff',
  'content_manager': 'Content Manager',
  'blogger': 'Blogger'
};

export const ROLE_PERMISSIONS = {
  'admin': {
    canManageStaff: true,
    canManageAllContent: true,
    canApproveContent: true,
    canPublishContent: true,
    canAssignRoles: true
  },
  'super_admin': {
    canManageStaff: true,
    canManageAllContent: true,
    canApproveContent: true,
    canPublishContent: true,
    canAssignRoles: true
  },
  'moderator': {
    canManageStaff: false,
    canManageAllContent: false,
    canApproveContent: true,
    canPublishContent: true,
    canAssignRoles: false
  },
  'content_manager': {
    canManageStaff: false,
    canManageAllContent: true,
    canApproveContent: true,
    canPublishContent: true,
    canAssignRoles: true
  },
  'blogger': {
    canManageStaff: false,
    canManageAllContent: false,
    canApproveContent: false,
    canPublishContent: false,
    canAssignRoles: false
  },
  'staff': {
    canManageStaff: false,
    canManageAllContent: false,
    canApproveContent: false,
    canPublishContent: false,
    canAssignRoles: false
  }
};
