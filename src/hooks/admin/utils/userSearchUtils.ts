
import { User } from './userTypes';

/**
 * Filter users based on search term, status, and role
 */
export const searchUsers = (
  allUsers: User[], 
  searchTermLocal: string, 
  statusFilterLocal: string, 
  roleFilterLocal: string
): User[] => {
  return allUsers.filter(user => {
    const statusMatch = statusFilterLocal === 'all' || user.status === statusFilterLocal;
    const roleMatch = roleFilterLocal === 'all' || user.role === roleFilterLocal;
    const searchLower = searchTermLocal.toLowerCase();
    const termMatch = searchTermLocal === '' || 
                      (user.username?.toLowerCase().includes(searchLower)) ||
                      (user.display_name?.toLowerCase().includes(searchLower)) ||
                      (user.email?.toLowerCase().includes(searchLower));
    return statusMatch && roleMatch && termMatch;
  });
};
