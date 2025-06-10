
import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useStaffPermissions } from "@/hooks/staff/useStaffPermissions";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Ban } from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";

// Import the enhanced user management hook
import { useUserManagement, type User } from "@/hooks/admin/useUserManagement";

// Import refactored components
import UserAuthAndLoadingStates from "@/components/staff/user-manager/UserAuthAndLoadingStates";
import UserManagerHeader from "@/components/staff/user-manager/UserManagerHeader";
import UserStatsCards from "@/components/staff/user-manager/UserStatsCards";
import UserTableCard from "@/components/staff/user-manager/UserTableCard";
import UserActionDialog from "@/components/staff/user-manager/UserActionDialog";
import UserMessageDialog from "@/components/staff/user-manager/UserMessageDialog";

// Import the optimized hook for dialog management
import { useOptimizedUserManagerDialogs } from "@/hooks/admin/useOptimizedUserManagerDialogs";

const StaffUserManager = () => {
  const navigate = useNavigate();
  const { isStaff, role, hasPermission, loading: permissionsLoading } = useStaffPermissions(); 
  const { toast } = useToast();
  
  // Use the real user management hook
  const {
    users,
    loading: usersLoading,
    error,
    updateUserStatus,
    sendUserMessage,
    refreshUsers,
    searchUsers
  } = useUserManagement();
  
  // Initialize state with stable initial values
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  // Use the optimized hook for dialog management
  const {
    actionDialog,
    actionReason,
    actionLoading,
    setActionReason,
    openActionDialog,
    closeActionDialog,
    handleUserAction,
    messageDialog,
    messageSubject,
    messageContent,
    messageLoading,
    setMessageSubject,
    setMessageContent,
    openMessageDialog,
    closeMessageDialog,
    handleSendMessage,
    isUserActionInProgress,
  } = useOptimizedUserManagerDialogs(updateUserStatus, sendUserMessage);

  // Memoize filtered users to prevent recalculation on every render
  const filteredUsers = useMemo(() => {
    return searchUsers(users, searchTerm, filterStatus, filterRole);
  }, [users, searchTerm, filterStatus, filterRole, searchUsers]);

  // Memoize badge functions to prevent recreation
  const getRoleBadge = useCallback((role: User['role']) => {
    const variants = {
      admin: 'destructive' as const,
      moderator: 'default' as const,
      user: 'secondary' as const
    };
    return <Badge variant={variants[role] || 'secondary'}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>;
  }, []);
  
  const getStatusBadge = useCallback((status: User['status']) => {
    const config = {
      active: { variant: 'default' as const, icon: CheckCircle, text: 'Active', className: 'bg-green-500 hover:bg-green-600' },
      suspended: { variant: 'secondary' as const, icon: Clock, text: 'Suspended', className: 'bg-yellow-500 hover:bg-yellow-600 text-black' },
      banned: { variant: 'destructive' as const, icon: Ban, text: 'Banned', className: '' }
    };
    const selectedConfig = config[status] || config.active;
    const { variant, icon: Icon, text, className } = selectedConfig;
    return (
      <Badge variant={variant} className={`flex items-center gap-1 ${className || ''}`}>
        <Icon className="h-3 w-3" />
        {text}
      </Badge>
    );
  }, []);

  const handleRefresh = useCallback(async () => {
    await refreshUsers();
    toast({
      title: "Data refreshed",
      description: "User data has been updated.",
    });
  }, [refreshUsers, toast]);

  // Check authorization using the new permission system
  const isAuthorized = isStaff && (role === 'admin' || role === 'super_admin' || hasPermission('user.view'));
  
  // Calculate overall loading state - coordinate both permissions and user data loading
  const isLoading = permissionsLoading || (usersLoading && !permissionsLoading && isAuthorized);

  const authAndLoadingState = (
    <UserAuthAndLoadingStates
      authLoading={permissionsLoading}
      dataLoading={isLoading && !permissionsLoading && isAuthorized}
      isAuthorized={!permissionsLoading && isAuthorized}
      onGoToHomepage={() => navigate('/')}
    />
  );

  // Show error state if there's an error loading users
  if (error && !permissionsLoading && isAuthorized) {
    return (
      <>
        <TitleUpdater title="Manage Users - Staff Panel" />
        <div className="min-h-screen bg-background text-foreground">
          <main className="container mx-auto px-4 py-20">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Users</h1>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button onClick={handleRefresh}>Try Again</button>
            </div>
          </main>
        </div>
      </>
    );
  }

  // Show loading state while permissions are loading or while authorized and data is loading
  if (isLoading || (!permissionsLoading && !isAuthorized)) {
    return authAndLoadingState;
  }

  return (
    <>
      <TitleUpdater title="Manage Users - Staff Panel" />
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto px-4 py-20">
          <UserManagerHeader
            onBackToDashboard={() => navigate('/staff/panel')}
            onRefreshData={handleRefresh}
          />
          <UserStatsCards users={users} />
          <UserTableCard
            filteredUsers={filteredUsers}
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            filterRole={filterRole}
            onFilterRoleChange={setFilterRole}
            getRoleBadge={getRoleBadge}
            getStatusBadge={getStatusBadge}
            onOpenActionDialog={openActionDialog}
            onOpenMessageDialog={openMessageDialog}
            isUserActionInProgress={isUserActionInProgress}
          />

          <UserActionDialog
            isOpen={actionDialog.open}
            action={actionDialog.action}
            user={actionDialog.user}
            reason={actionReason}
            onReasonChange={setActionReason}
            onConfirm={handleUserAction}
            onClose={closeActionDialog}
            isLoading={actionLoading}
          />

          <UserMessageDialog
            isOpen={messageDialog.open}
            user={messageDialog.user}
            subject={messageSubject}
            content={messageContent}
            onSubjectChange={setMessageSubject}
            onContentChange={setMessageContent}
            onSend={handleSendMessage}
            onClose={closeMessageDialog}
            isLoading={messageLoading}
          />
        </main>
      </div>
    </>
  );
};

export default StaffUserManager;
