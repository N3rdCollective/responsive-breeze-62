
import React from 'react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, FileText, Mail, UserX, Ban, UserCheck, Users } from 'lucide-react';
import { User } from '@/hooks/admin/useUserManagement';
import LoadingSpinner from '@/components/staff/LoadingSpinner';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  error: string | null;
  onOpenActionDialog: (action: 'suspend' | 'ban' | 'unban', user: User) => void;
  onOpenMessageDialog: (user: User) => void;
  getRoleBadge: (role: User['role']) => JSX.Element;
  getStatusBadge: (status: User['status']) => JSX.Element;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  isLoading,
  error,
  onOpenActionDialog,
  onOpenMessageDialog,
  getRoleBadge,
  getStatusBadge,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-500 bg-red-50 rounded-md">
        Error loading users: {error}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No users found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="hidden md:table-cell">Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Joined</TableHead>
            <TableHead className="hidden lg:table-cell text-center">Forum Posts</TableHead>
            <TableHead className="hidden lg:table-cell text-center">Timeline Posts</TableHead>
            <TableHead className="hidden lg:table-cell text-center">Reports</TableHead>
            <TableHead className="hidden md:table-cell">Last Active</TableHead>
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
                        alt={user.display_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">
                        {user.display_name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{user.display_name}</p>
                    <p className="text-xs text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm">{user.email}</TableCell>
              <TableCell className="hidden md:table-cell">{getRoleBadge(user.role)}</TableCell>
              <TableCell>{getStatusBadge(user.status)}</TableCell>
              <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-center hidden lg:table-cell">{user.forum_post_count ?? 0}</TableCell>
              <TableCell className="text-center hidden lg:table-cell">{user.timeline_post_count ?? 0}</TableCell>
              <TableCell className="text-center hidden lg:table-cell">
                {user.pending_report_count && user.pending_report_count > 0 ? (
                  <Badge variant="destructive" className="text-xs">
                    {user.pending_report_count}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                {user.last_active ? new Date(user.last_active).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => console.log(`View profile: ${user.id}`)}>
                      <Eye className="mr-2 h-4 w-4" /> View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log(`View posts: ${user.id}`)}>
                      <FileText className="mr-2 h-4 w-4" /> View Posts
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onOpenMessageDialog(user)}>
                      <Mail className="mr-2 h-4 w-4" /> Send Message
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.status === 'active' && (
                      <>
                        <DropdownMenuItem
                          className="text-yellow-600 focus:text-yellow-700 focus:bg-yellow-100"
                          onClick={() => onOpenActionDialog('suspend', user)}
                        >
                          <UserX className="mr-2 h-4 w-4" /> Suspend User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-700 focus:bg-red-100"
                          onClick={() => onOpenActionDialog('ban', user)}
                        >
                          <Ban className="mr-2 h-4 w-4" /> Ban User
                        </DropdownMenuItem>
                      </>
                    )}
                    {(user.status === 'suspended' || user.status === 'banned') && (
                      <DropdownMenuItem
                        className="text-green-600 focus:text-green-700 focus:bg-green-100"
                        onClick={() => onOpenActionDialog('unban', user)}
                      >
                        <UserCheck className="mr-2 h-4 w-4" /> Restore User
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

export default UserTable;

