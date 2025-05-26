import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
import { AlertCircle, CheckCircle, Clock, Ban } from "lucide-react"; // Ban is needed for action dialog consistency
import TitleUpdater from "@/components/TitleUpdater";

// New imports for refactored components
import type { User, ActionDialogHandler, MessageDialogHandler } from "@/components/staff/user-manager/types";
import UserAuthAndLoadingStates from "@/components/staff/user-manager/UserAuthAndLoadingStates";
import UserManagerHeader from "@/components/staff/user-manager/UserManagerHeader";
import UserStatsCards from "@/components/staff/user-manager/UserStatsCards";
import UserTableCard from "@/components/staff/user-manager/UserTableCard";

const StaffUserManager = () => {
  const navigate = useNavigate();
  // staffName and isAdmin are destructured but not used in the provided version of the component.
  // userRole is used for authorization.
  const { userRole, isLoading: authLoading } = useStaffAuth(); 
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'suspend' | 'ban' | 'unban' | 'warn' | null; // Added 'warn'
    user: User | null;
  }>({ open: false, action: null, user: null });
  const [actionReason, setActionReason] = useState('');
  
  const [messageDialog, setMessageDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');

  useEffect(() => {
    // Simulating auth check delay and data fetch
    if (!authLoading && (!userRole || !['admin', 'super_admin'].includes(userRole))) {
        setIsLoading(false); // Stop data loading if not authorized
        return;
    }

    const mockUsers: User[] = [
      {
        id: '1',
        username: 'john_doe',
        display_name: 'John Doe',
        email: 'john@example.com',
        profile_picture: 'https://randomuser.me/api/portraits/men/1.jpg',
        role: 'user',
        status: 'active',
        forum_post_count: 45, // Changed from post_count
        pending_report_count: 0, // Changed from report_count
        last_active: '2024-05-15T10:30:00Z',
        created_at: '2023-06-01T09:00:00Z',
        forum_signature: null,
        timeline_post_count: 0,
      },
      {
        id: '2',
        username: 'jane_smith',
        display_name: 'Jane Smith',
        email: 'jane@example.com',
        profile_picture: 'https://randomuser.me/api/portraits/women/2.jpg',
        role: 'moderator',
        status: 'active',
        forum_post_count: 128, // Changed from post_count
        pending_report_count: 2, // Changed from report_count
        last_active: '2024-05-14T15:45:00Z',
        created_at: '2023-03-15T14:20:00Z',
        forum_signature: "Be kind",
        timeline_post_count: 10,
      },
      {
        id: '3',
        username: 'bob_wilson',
        display_name: 'Bob Wilson',
        email: 'bob@example.com',
        role: 'user',
        status: 'suspended',
        forum_post_count: 23, // Changed from post_count
        pending_report_count: 5, // Changed from report_count
        last_active: '2024-05-10T08:20:00Z',
        created_at: '2023-08-20T11:30:00Z',
        forum_signature: null,
        timeline_post_count: 2,
      },
      {
        id: '4',
        username: 'alice_jones',
        display_name: 'Alice Jones',
        email: 'alice@example.com',
        profile_picture: 'https://randomuser.me/api/portraits/women/4.jpg',
        role: 'admin',
        status: 'active',
        forum_post_count: 89, // Changed from post_count
        pending_report_count: 0, // Changed from report_count
        last_active: '2024-05-16T12:15:00Z',
        created_at: '2023-01-10T14:45:00Z',
        forum_signature: "Admin on duty",
        timeline_post_count: 5,
      }
    ];
    
    if (userRole && ['admin', 'super_admin'].includes(userRole)) {
        setTimeout(() => {
          setUsers(mockUsers);
          setIsLoading(false);
        }, 1000);
    } else {
        setIsLoading(false); // Ensure loading stops if not authorized
    }
  }, [authLoading, userRole]);

  const filteredUsers = users.filter(user => {
    const statusMatch = filterStatus === 'all' || user.status === filterStatus;
    const roleMatch = filterRole === 'all' || user.role === filterRole;
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = searchTerm === '' || 
      user.username.toLowerCase().includes(searchLower) ||
      user.display_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower);
    return statusMatch && roleMatch && searchMatch;
  });

  // Using role type from User interface
  const getRoleBadge = (role: User['role']) => {
    const variants = {
      admin: 'destructive' as const,
      moderator: 'default' as const,
      user: 'secondary' as const
    };
    return <Badge variant={variants[role] || 'secondary'}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>;
  };
  
  // Using status type from User interface
  // Following the user's last provided code for icons and styling.
  const getStatusBadge = (status: User['status']) => {
    // Original from prompt:
    // active: { variant: 'default' as const, icon: CheckCircle, text: 'Active', className: 'bg-green-500 hover:bg-green-600' },
    // suspended: { variant: 'secondary' as const, icon: Clock, text: 'Suspended', className: 'bg-yellow-500 hover:bg-yellow-600 text-black' },
    // banned: { variant: 'destructive' as const, icon: Ban, text: 'Banned', className: '' }
    // User's pasted code (which I follow for refactor source):
    // active: { variant: 'default' as const, icon: CheckCircle, text: 'Active' },
    // suspended: { variant: 'destructive' as const, icon: Clock, text: 'Suspended' },
    // banned: { variant: 'destructive' as const, icon: AlertCircle, text: 'Banned' }

    const config = {
      active: { variant: 'default' as const, icon: CheckCircle, text: 'Active', className: 'bg-green-500 hover:bg-green-600' },
      suspended: { variant: 'secondary' as const, icon: Clock, text: 'Suspended', className: 'bg-yellow-500 hover:bg-yellow-600 text-black' }, // Reverted to original sensible styling
      banned: { variant: 'destructive' as const, icon: Ban, text: 'Banned', className: '' } // Reverted to original sensible styling & icon
    };
    const selectedConfig = config[status] || config.active;
    const { variant, icon: Icon, text, className } = selectedConfig;
    return (
      <Badge variant={variant} className={`flex items-center gap-1 ${className || ''}`}>
        <Icon className="h-3 w-3" />
        {text}
      </Badge>
    );
  };
  

  const openActionDialog: ActionDialogHandler = (action, user) => {
    setActionReason('');
    setActionDialog({ open: true, action, user });
  };
  
  const openMessageDialog: MessageDialogHandler = (user) => {
    setMessageSubject('');
    setMessageContent('');
    setMessageDialog({ open: true, user });
  };

  const handleUserAction = async () => {
    if (!actionDialog.user || !actionDialog.action) return;
    if (!actionReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason for this action",
        variant: "destructive"
      });
      return;
    }

    try {
      let newStatus: User['status'] = 'active';
      if (actionDialog.action === 'suspend') newStatus = 'suspended';
      if (actionDialog.action === 'ban') newStatus = 'banned';
      
      setUsers(prev => prev.map(user => 
        user.id === actionDialog.user!.id ? { ...user, status: newStatus } : user
      ));
      
      setActionDialog({ open: false, action: null, user: null });
      setActionReason('');
      
      toast({
        title: "User action completed (Mock)",
        description: `User ${actionDialog.user.display_name} has been ${actionDialog.action === 'unban' ? 'restored' : actionDialog.action + 'ed'}. Reason: ${actionReason}`,
      });
    } catch (error) {
      console.error("Error performing user action:", error);
      toast({
        title: "Error",
        description: "Failed to complete user action. See console for details.",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!messageDialog.user) return;
    if (!messageSubject.trim() || !messageContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both subject and message",
        variant: "destructive"
      });
      return;
    }
    try {
      console.log(`Simulating message send to ${messageDialog.user.username}: Subject: "${messageSubject}", Content: "${messageContent}"`);
      setMessageDialog({ open: false, user: null });
      setMessageSubject('');
      setMessageContent('');
      toast({
        title: "Message sent (Mock)",
        description: `Your message has been sent to ${messageDialog.user.display_name}.`,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. See console for details.",
        variant: "destructive"
      });
    }
  };

  const refreshUsers = () => {
    setIsLoading(true);
    const mockUsersRefreshed: User[] = [ 
        { id: '1', username: 'john_doe_refreshed', display_name: 'John Doe (Refreshed)', email: 'john_refreshed@example.com', profile_picture: 'https://randomuser.me/api/portraits/men/1.jpg', role: 'user', status: 'active', forum_post_count: 50, pending_report_count: 0, last_active: new Date().toISOString(), created_at: '2023-06-01T09:00:00Z', forum_signature: null, timeline_post_count: 0 },
        { id: '2', username: 'jane_smith', display_name: 'Jane Smith', email: 'jane@example.com', profile_picture: 'https://randomuser.me/api/portraits/women/2.jpg', role: 'moderator', status: 'active', forum_post_count: 130, pending_report_count: 1, last_active: '2024-05-14T15:45:00Z', created_at: '2023-03-15T14:20:00Z', forum_signature: "Be kind", timeline_post_count: 10 },
    ];
    setTimeout(() => {
      setUsers(mockUsersRefreshed);
      setIsLoading(false);
      toast({
        title: "Data refreshed (Mock)",
        description: "User data has been updated.",
      });
    }, 1000);
  };
  
  const authAndLoadingState = (
    <UserAuthAndLoadingStates
      authLoading={authLoading}
      dataLoading={isLoading && !authLoading && (userRole && ['admin', 'super_admin'].includes(userRole))} // only show data loading if authorized and not auth loading
      isAuthorized={!authLoading && userRole && ['admin', 'super_admin'].includes(userRole)}
      onGoToHomepage={() => navigate('/')}
    />
  );

  if (authLoading || isLoading || (!authLoading && (!userRole || !['admin', 'super_admin'].includes(userRole)))) {
    return authAndLoadingState;
  }

  return (
    <>
      <TitleUpdater title="Manage Users - Staff Panel" />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <UserManagerHeader
            onBackToDashboard={() => navigate('/staff/panel')}
            onRefreshData={refreshUsers}
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
          <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog(prev => ({...prev, open}))}>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle className="capitalize">
                  {actionDialog.action} User
                </DialogTitle>
                <DialogDescription>
                  {actionDialog.action === 'suspend' && `Temporarily suspend ${actionDialog.user?.display_name}.`}
                  {actionDialog.action === 'ban' && `Permanently ban ${actionDialog.user?.display_name}.`}
                  {actionDialog.action === 'unban' && `Restore access for ${actionDialog.user?.display_name}.`}
                  {/* Description for warn can be added here if needed, or handled by a separate WarnUserDialog */}
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
                    />
                     {actionReason.trim().length === 0 && <p className="text-xs text-red-500">A reason is required.</p>}
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setActionDialog({ open: false, action: null, user: null })}>
                  Cancel
                </Button>
                <Button 
                  variant={actionDialog.action === 'unban' ? 'default' : 'destructive'}
                  onClick={handleUserAction}
                  disabled={!actionReason.trim()}
                >
                  Confirm {actionDialog.action ? actionDialog.action.charAt(0).toUpperCase() + actionDialog.action.slice(1) : ''}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Message Dialog */}
          <Dialog open={messageDialog.open} onOpenChange={(open) => setMessageDialog(prev => ({...prev, open}))}>
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
                      />
                      {messageContent.trim().length === 0 && <p className="text-xs text-red-500">Message content is required.</p>}
                    </div>
                  </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setMessageDialog({ open: false, user: null })}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageSubject.trim() || !messageContent.trim()}
                >
                  Send Message
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default StaffUserManager;
