
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UserFilters from "./UserFilters";
import UserTableContent from "./UserTableContent";
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
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          Community Members
          <Badge variant="outline" className="ml-auto font-normal">
            {filteredUsers.length} matching users
          </Badge>
        </CardTitle>
        <CardDescription>
          Use the filters and search to find specific users. Click actions for more options.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <UserFilters
          searchTerm={searchTerm}
          onSearchTermChange={onSearchTermChange}
          filterStatus={filterStatus}
          onFilterStatusChange={onFilterStatusChange}
          filterRole={filterRole}
          onFilterRoleChange={onFilterRoleChange}
        />
        <UserTableContent
          users={filteredUsers}
          getRoleBadge={getRoleBadge}
          getStatusBadge={getStatusBadge}
          onOpenActionDialog={onOpenActionDialog}
          onOpenMessageDialog={onOpenMessageDialog}
        />
      </CardContent>
    </Card>
  );
};

export default UserTableCard;
