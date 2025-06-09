
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Clock, Ban, AlertTriangle } from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";

// Import the enhanced user management hook
import { useUserManagement, type User } from "@/hooks/admin/useUserManagement";

// New imports for refactored components
import type { ActionDialogHandler, MessageDialogHandler } from "@/components/staff/user-manager/types";
import UserAuthAndLoadingStates from "@/components/staff/user-manager/UserAuthAndLoadingStates";
import UserManagerHeader from "@/components/staff/user-manager/UserManagerHeader";
import UserStatsCards from "@/components/staff/user-manager/UserStatsCards";
import UserTableCard from "@/components/staff/user-manager/UserTableCard";

const StaffUserManager = () => {
  const navigate = useNavigate();
  const { userRole, isLoading: authLoading } = useStaffAuth(); 
  const { toast } = useToast();
  
  // Use the real user management hook
  const {
    users,
    loading: isLoading,
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
  
  // Action dialog state with stable initial structure
  const [actionDialog, setActionDialog] = useState({
    open: false,
    action: null as 'suspend' | 'ban' | 'unban' | 'warn' | null,
    user: null as User | null
  });
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Message dialog state with stable initial structure
  const [messageDialog, setMessageDialog] = useState({
    open: false,
    user: null as User | null
  });
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);

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

  // Memoize dialog handlers to prevent recreation
  const openActionDialog: ActionDialogHandler = useCallback((action, user) => {
    setActionReason('');
    setActionDialog({ open: true, action, user });
  }, []);
  
  const openMessageDialog: MessageDialogHandler = useCallback((user) => {
    setMessageSubject('');
    setMessageContent('');
    setMessageDialog({ open: true, user });
  }, []);

  const handleUserAction = useCallback(async () => {
    if (!actionDialog.user || !actionDialog.action || actionLoading) return;
    if (!actionReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for this action",
        variant: "destructive"
      });
      return;
    }

    setActionLoading(true);
    try {
      let newStatus: User['status'] = 'active';
      if (actionDialog.action === 'suspend') newStatus = 'suspended';
      if (actionDialog.action === 'ban') newStatus = 'banned';
      if (actionDialog.action === 'unban') newStatus = 'active';
      
      const success = await updateUserStatus(
        actionDialog.user.id, 
        newStatus, 
        actionReason, 
        actionDialog.action as 'suspend' | 'ban' | 'unban'
      );
      
      if (success) {
        // Batch state resets together
        setActionDialog({ open: false, action: null, user: null });
        setActionReason('');
        
        toast({
          title: "User action completed",
          description: `User ${actionDialog.user.display_name} has been ${actionDialog.action === 'unban' ? 'restored' : actionDialog.action + 'ed'}. Reason: ${actionReason}`,
        });
      }
    } catch (error) {
      console.error("Error performing user action:", error);
      toast({
        title: "Error",
        description: "Failed to complete user action. Please try again.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  }, [actionDialog, actionReason, actionLoading, updateUserStatus, toast]);

  const handleSendMessage = useCallback(async () => {
    if (!messageDialog.user || messageLoading) return;
    if (!messageSubject.trim() || !messageContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both subject and message",
        variant: "destructive"
      });
      return;
    }
    
    setMessageLoading(true);
    try {
      const success = await sendUserMessage(messageDialog.user.id, messageSubject, messageContent);
      
      if (success) {
        // Batch state resets together
        setMessageDialog({ open: false, user: null });
        setMessageSubject('');
        setMessageContent('');
        
        toast({
          title: "Message sent",
          description: `Your message has been sent to ${messageDialog.user.display_name}.`,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setMessageLoading(false);
    }
  }, [messageDialog, messageSubject, messageContent, messageLoading, sendUserMessage, toast]);

  const handleRefresh = useCallback(async () => {
    await refreshUsers();
    toast({
      title: "Data refreshed",
      description: "User data has been updated.",
    });
  }, [refreshUsers, toast]);

  // Memoize dialog close handlers
  const closeActionDialog = useCallback(() => {
    setActionDialog({ open: false, action: null, user: null });
    setActionReason('');
  }, []);

  const closeMessageDialog = useCallback(() => {
    setMessageDialog({ open: false, user: null });
    setMessageSubject('');
    setMessageContent('');
  }, []);
  
  const authAndLoadingState = (
    <UserAuthAndLoadingStates
      authLoading={authLoading}
      dataLoading={isLoading && !authLoading && (userRole && ['admin', 'super_admin'].includes(userRole))}
      isAuthorized={!authLoading && userRole && ['admin', 'super_admin'].includes(userRole)}
      onGoToHomepage={() => navigate('/')}
    />
  );

  // Show error state if there's an error loading users
  if (error && !authLoading && userRole && ['admin', 'super_admin'].includes(userRole)) {
    return (
      <>
        <TitleUpdater title="Manage Users - Staff Panel" />
        <div className="min-h-screen bg-background text-foreground">
          <main className="container mx-auto px-4 py-20">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Users</h1>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh}>Try Again</Button>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (authLoading || isLoading || (!authLoading && (!userRole || !['admin', 'super_admin'].includes(userRole)))) {
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
          />

          {/* User Action Dialog */}
          <Dialog open={actionDialog.open} onOpenChange={(open) => !open && closeActionDialog()}>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle className="capitalize">
                  {actionDialog.action} User
                </DialogTitle>
                <DialogDescription>
                  {actionDialog.action === 'suspend' && `Temporarily suspend ${actionDialog.user?.display_name}.`}
                  {actionDialog.action === 'ban' && `Permanently ban ${actionDialog.user?.display_name}.`}
                  {actionDialog.action === 'unban' && `Restore access for ${actionDialog.user?.display_name}.`}
                  {actionDialog.action === 'warn' && `Send a warning to ${actionDialog.user?.display_name}.`}
                </DialogDescription>
              </DialogHeader>
              {actionDialog.user && (
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 dark:bg-muted/20 rounded-lg border">
                     <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        {actionDialog.user.profile_picture ? (
                          <img
                            src={actionDialog.user.profile_picture}
                            alt={actionDialog.user.display_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-medium text-muted-foreground">
                            {actionDialog.user.display_name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    <div>
                      <p className="font-semibold">{actionDialog.user.display_name}</p>
                      <p className="text-sm text-muted-foreground">@{actionDialog.user.username}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="action-reason">Reason for action</Label>
                    <Textarea
                      id="action-reason"
                      placeholder={`Enter reason for ${actionDialog.action}...`}
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      className="min-h-[80px]"
                      disabled={actionLoading}
                    />
                     {actionReason.trim().length === 0 && <p className="text-xs text-red-500">A reason is required.</p>}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={closeActionDialog} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button 
                  variant={actionDialog.action === 'unban' ? 'default' : 'destructive'}
                  onClick={handleUserAction}
                  disabled={!actionReason.trim() || actionLoading}
                >
                  {actionLoading ? 'Processing...' : `Confirm ${actionDialog.action ? actionDialog.action.charAt(0).toUpperCase() + actionDialog.action.slice(1) : ''}`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Message Dialog */}
          <Dialog open={messageDialog.open} onOpenChange={(open) => !open && closeMessageDialog()}>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Send Message to {messageDialog.user?.display_name}</DialogTitle>
                <DialogDescription>
                  Compose an administrative message to @{messageDialog.user?.username}.
                </DialogDescription>
              </DialogHeader>
              {messageDialog.user && (
                 <div className="space-y-4 py-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 dark:bg-muted/20 rounded-lg border">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        {messageDialog.user.profile_picture ? (
                          <img
                            src={messageDialog.user.profile_picture}
                            alt={messageDialog.user.display_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-medium text-muted-foreground">
                            {messageDialog.user.display_name?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{messageDialog.user.display_name}</p>
                        <p className="text-sm text-muted-foreground">@{messageDialog.user.username}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="message-subject">Subject</Label>
                      <Input
                        id="message-subject"
                        value={messageSubject}
                        onChange={(e) => setMessageSubject(e.target.value)}
                        placeholder="Message subject"
                        disabled={messageLoading}
                      />
                      {messageSubject.trim().length === 0 && <p className="text-xs text-red-500">Subject is required.</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="message-content">Message</Label>
                      <Textarea
                        id="message-content"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Write your message..."
                        className="min-h-[100px]"
                        disabled={messageLoading}
                      />
                      {messageContent.trim().length === 0 && <p className="text-xs text-red-500">Message content is required.</p>}
                    </div>
                  </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={closeMessageDialog} disabled={messageLoading}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageSubject.trim() || !messageContent.trim() || messageLoading}
                >
                  {messageLoading ? 'Sending...' : 'Send Message'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </>
  );
};

export default StaffUserManager;
