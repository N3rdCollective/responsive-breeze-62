
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import OptimizedUserTableContent from './OptimizedUserTableContent';
import type { User, ActionDialogHandler, MessageDialogHandler } from "./types";

interface UserTableCardProps {
  filteredUsers: User[];
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  filterRole: string;
  onFilterRoleChange: (role: string) => void;
  getRoleBadge: (role: User['role']) => JSX.Element;
  getStatusBadge: (status: User['status']) => JSX.Element;
  onOpenActionDialog: ActionDialogHandler;
  onOpenMessageDialog: MessageDialogHandler;
  isUserActionInProgress: (userId: string) => boolean;
}

const UserTableCard: React.FC<UserTableCardProps> = ({
  filteredUsers,
  searchTerm,
  onSearchTermChange,
  filterStatus,
  onFilterStatusChange,
  filterRole,
  onFilterRoleChange,
  getRoleBadge,
  getStatusBadge,
  onOpenActionDialog,
  onOpenMessageDialog,
  isUserActionInProgress,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user accounts, view activity, and perform moderation actions.
        </CardDescription>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="flex-1"
          />
          <Select value={filterStatus} onValueChange={onFilterStatusChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRole} onValueChange={onFilterRoleChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <OptimizedUserTableContent
          users={filteredUsers}
          getRoleBadge={getRoleBadge}
          getStatusBadge={getStatusBadge}
          onOpenActionDialog={onOpenActionDialog}
          onOpenMessageDialog={onOpenMessageDialog}
          isUserActionInProgress={isUserActionInProgress}
        />
      </CardContent>
    </Card>
  );
};

export default UserTableCard;
