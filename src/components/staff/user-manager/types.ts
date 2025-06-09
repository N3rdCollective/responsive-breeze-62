
// Re-export User type from the hook
export type { User } from '@/hooks/admin/useUserManagement';

// Dialog handler types
export type ActionDialogHandler = (action: 'suspend' | 'ban' | 'unban' | 'warn', user: User) => void;
export type MessageDialogHandler = (user: User) => void;

// Re-export from useUserManagement for convenience
import type { User } from '@/hooks/admin/useUserManagement';
