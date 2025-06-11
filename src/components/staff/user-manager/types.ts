
import { UserManagementUser } from '@/hooks/admin/useUserManagement';

// Use the centralized user interface from the hook
export type User = UserManagementUser;

// Dialog handler types
export type ActionDialogHandler = (action: 'suspend' | 'ban' | 'unban', user: User) => void;
export type MessageDialogHandler = (user: User) => void;
