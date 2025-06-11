
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, MessageSquare, Mail, UserX, Ban, UserCheck, Users, Edit } from "lucide-react";
import type { UserManagementUser } from "@/hooks/admin/useUserManagement";

type User = UserManagementUser;
type ActionDialogHandler = (action: 'suspend' | 'ban' | 'unban', user: User) => void;
type MessageDialogHandler = (user: User) => void;

interface OptimizedUserTableContentProps {
  users: User[];
  getRoleBadge: (role: User['role']) => JSX.Element;
  getStatusBadge: (status: User['status']) => JSX.Element;
  onOpenActionDialog: ActionDialogHandler;
  onOpenMessageDialog: MessageDialogHandler;
  isUserActionInProgress: (userId: string) => boolean;
}

const OptimizedUserTableContent: React.FC<OptimizedUserTableContentProps> = ({
  users,
  getRoleBadge,
  getStatusBadge,
  onOpenActionDialog,
  onOpenMessageDialog,
  isUserActionInProgress,
}) => {
  const navigate = useNavigate();

  if (users.length === 0) {
    return (
      <div className="h-24 text-center flex flex-col items-center justify-center text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
        No users found matching your filters.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Posts</TableHead>
            <TableHead className="text-center">Reports</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {user.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user.display_name || user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-medium text-muted-foreground">
                        {(user.display_name || user.username)?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{user.display_name || user.username}</p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell>{getStatusBadge(user.status)}</TableCell>
              <TableCell className="text-center">
                {(user.forum_post_count || 0) + (user.timeline_post_count || 0)}
              </TableCell>
              <TableCell className="text-center">
                {(user.pending_report_count || 0) > 0 ? (
                  <Badge variant="destructive" className="text-xs">
                    {user.pending_report_count}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {user.last_active ? new Date(user.last_active).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      disabled={isUserActionInProgress(user.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate(`/staff/users/edit/${user.id}`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert(`View profile for ${user.username}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert(`View posts by ${user.username}`)}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      View Posts
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onOpenMessageDialog(user)}>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.status === 'active' && (
                      <>
                        <DropdownMenuItem
                          className="text-yellow-600 focus:text-yellow-700 focus:bg-yellow-100 dark:text-yellow-400 dark:focus:text-yellow-300 dark:focus:bg-yellow-500/30"
                          onClick={() => onOpenActionDialog('suspend', user)}
                          disabled={isUserActionInProgress(user.id)}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Suspend User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-700 focus:bg-red-100 dark:text-red-400 dark:focus:text-red-300 dark:focus:bg-red-500/30"
                          onClick={() => onOpenActionDialog('ban', user)}
                          disabled={isUserActionInProgress(user.id)}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Ban User
                        </DropdownMenuItem>
                      </>
                    )}
                    {(user.status === 'suspended' || user.status === 'banned') && (
                      <DropdownMenuItem
                        className="text-green-600 focus:text-green-700 focus:bg-green-100 dark:text-green-400 dark:focus:text-green-300 dark:focus:bg-green-500/30"
                        onClick={() => onOpenActionDialog('unban', user)}
                        disabled={isUserActionInProgress(user.id)}
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        Restore User
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OptimizedUserTableContent;
