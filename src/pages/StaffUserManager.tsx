import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { 
  ArrowLeft, 
  Users, 
  Search,
  MoreHorizontal,
  Ban,
  UserCheck,
  UserX,
  Mail,
  MessageSquare,
  Eye,
  RefreshCw
} from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";

interface User {
  id: string;
  username: string;
  display_name: string;
  email: string;
  profile_picture?: string;
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  post_count: number;
  report_count: number;
  last_active: string;
  created_at: string;
}

const StaffUserManager = () => {
  const navigate = useNavigate();
  const { userRole, isLoading: authLoading } = useStaffAuth(); // Removed staffName, isAdmin as they are not used in this version.
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  
  // Dialog states
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'suspend' | 'ban' | 'unban' | null;
    user: User | null;
  }>({ open: false, action: null, user: null });
  const [actionReason, setActionReason] = useState('');
  const [messageDialog, setMessageDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({ open: false, user: null });
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Check staff authorization before loading data or showing content
    if (!authLoading && (!userRole || !['admin', 'super_admin'].includes(userRole))) {
      setIsLoading(false); // Stop loading as access is denied
      return; // Don't fetch mock data if not authorized
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
        post_count: 45,
        report_count: 0,
        last_active: '2024-05-15T10:30:00Z',
        created_at: '2023-06-01T09:00:00Z'
      },
      {
        id: '2',
        username: 'jane_smith',
        display_name: 'Jane Smith',
        email: 'jane@example.com',
        profile_picture: 'https://randomuser.me/api/portraits/women/2.jpg',
        role: 'moderator',
        status: 'active',
        post_count: 128,
        report_count: 2,
        last_active: '2024-05-14T15:45:00Z',
        created_at: '2023-03-15T14:20:00Z'
      },
      {
        id: '3',
        username: 'bob_wilson',
        display_name: 'Bob Wilson',
        email: 'bob@example.com',
        // No profile picture for Bob
        role: 'user',
        status: 'suspended',
        post_count: 23,
        report_count: 5,
        last_active: '2024-05-10T08:20:00Z',
        created_at: '2023-08-20T11:30:00Z'
      },
      {
        id: '4',
        username: 'alice_jones',
        display_name: 'Alice Jones',
        email: 'alice@example.com',
        profile_picture: 'https://randomuser.me/api/portraits/women/4.jpg',
        role: 'admin',
        status: 'active',
        post_count: 89,
        report_count: 0,
        last_active: '2024-05-16T12:15:00Z',
        created_at: '2023-01-10T14:45:00Z'
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

  const getRoleBadge = (role: User['role']) => {
    const variants = {
      admin: 'destructive' as const,
      moderator: 'default' as const,
      user: 'secondary' as const
    };
    return <Badge variant={variants[role] || 'secondary'}>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>;
  };

  const getStatusBadge = (status: User['status']) => {
    const config = {
      active: { variant: 'default' as const, icon: CheckCircle, text: 'Active', className: 'bg-green-500 hover:bg-green-600' },
      suspended: { variant: 'secondary' as const, icon: Clock, text: 'Suspended', className: 'bg-yellow-500 hover:bg-yellow-600 text-black' },
      banned: { variant: 'destructive' as const, icon: Ban, text: 'Banned', className: '' } // Added className here
    };
    const selectedConfig = config[status] || config.active; // Get the specific config or fallback to active
    const { variant, icon: Icon, text, className } = selectedConfig; // Destructure, className will now always be present
    return (
      <Badge variant={variant} className={`flex items-center gap-1 ${className || ''}`}>
        <Icon className="h-3 w-3" />
        {text}
      </Badge>
    );
  };

  const openActionDialog = (action: 'suspend' | 'ban' | 'unban', user: User) => {
    setActionReason(''); // Clear previous reason
    setActionDialog({ open: true, action, user });
  };
  
  const openMessageDialog = (user: User) => {
    setMessageSubject(''); // Clear previous subject
    setMessageContent(''); // Clear previous content
    setMessageDialog({ open: true, user });
  };


  const handleUserAction = async () => { // Removed parameters, will use state
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
      let newStatus: User['status'] = 'active'; // Default to active for unban
      if (actionDialog.action === 'suspend') newStatus = 'suspended';
      if (actionDialog.action === 'ban') newStatus = 'banned';
      
      // Mock: Update user status in local state
      console.log(`Simulating ${actionDialog.action} for user ${actionDialog.user.id} with reason: "${actionReason}" new status: ${newStatus}`);
      setUsers(prev => prev.map(user => 
        user.id === actionDialog.user!.id ? { ...user, status: newStatus } : user
      ));
      
      setActionDialog({ open: false, action: null, user: null });
      setActionReason(''); // Clear reason after successful action
      
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
      // Mock send message
      console.log(`Simulating message send to ${messageDialog.user.username}: Subject: "${messageSubject}", Content: "${messageContent}"`);
      setMessageDialog({ open: false, user: null });
      setMessageSubject(''); // Clear form
      setMessageContent(''); // Clear form
      
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
    // Re-fetch mock data to simulate refresh
    const mockUsers: User[] = [ // Copied from useEffect for simulation
        { id: '1', username: 'john_doe_refreshed', display_name: 'John Doe (Refreshed)', email: 'john_refreshed@example.com', profile_picture: 'https://randomuser.me/api/portraits/men/1.jpg', role: 'user', status: 'active', post_count: 50, report_count: 0, last_active: new Date().toISOString(), created_at: '2023-06-01T09:00:00Z' },
        { id: '2', username: 'jane_smith', display_name: 'Jane Smith', email: 'jane@example.com', profile_picture: 'https://randomuser.me/api/portraits/women/2.jpg', role: 'moderator', status: 'active', post_count: 130, report_count: 1, last_active: '2024-05-14T15:45:00Z', created_at: '2023-03-15T14:20:00Z'},
        // Add more or vary data to show refresh
    ];
    setTimeout(() => {
      setUsers(mockUsers); // Use a slightly different dataset or re-initialize
      setIsLoading(false);
      toast({
        title: "Data refreshed (Mock)",
        description: "User data has been updated.",
      });
    }, 1000);
  };
  
  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-128px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // Access Denied
  if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="mb-6">You do not have permission to manage users.</p>
          <Button onClick={() => navigate('/')}>Go to Homepage</Button>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Data loading state (after auth check)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-128px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }


  return (
    <>
      <TitleUpdater title="Manage Users - Staff Panel" />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/staff/panel')} className="shrink-0">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Panel
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <Users className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                  User Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  Oversee community members, roles, and account status.
                </p>
              </div>
            </div>
            <Button onClick={refreshUsers} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.status === 'active').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Suspended</CardTitle>
                <Clock className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {users.filter(u => u.status === 'suspended').length}
                </div>
              </CardContent>
            </Card>
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Banned</CardTitle>
                <Ban className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.status === 'banned').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                Community Members
                <Badge variant="outline" className="ml-auto font-normal">
                  {filteredUsers.length} matching users
                </Badge>
              </CardTitle>
              <DialogDescription>
                Use the filters and search to find specific users. Click actions for more options.
              </DialogDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by username, display name, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Table */}
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
                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
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
                                <span className="text-lg font-medium text-muted-foreground">
                                  {user.display_name?.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{user.display_name}</p>
                              <p className="text-xs text-muted-foreground">@{user.username}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-center">{user.post_count}</TableCell>
                        <TableCell className="text-center">
                          {user.report_count > 0 ? (
                            <Badge variant="destructive" className="text-xs">
                              {user.report_count}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(user.last_active).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => alert(`View profile for ${user.username}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => alert(`View posts by ${user.username}`)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                View Posts
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openMessageDialog(user)}>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.status === 'active' && (
                                <>
                                  <DropdownMenuItem 
                                    className="text-yellow-600 focus:text-yellow-700 focus:bg-yellow-100"
                                    onClick={() => openActionDialog('suspend', user)}
                                  >
                                    <UserX className="mr-2 h-4 w-4" />
                                    Suspend User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600 focus:text-red-700 focus:bg-red-100"
                                    onClick={() => openActionDialog('ban', user)}
                                  >
                                    <Ban className="mr-2 h-4 w-4" />
                                    Ban User
                                  </DropdownMenuItem>
                                </>
                              )}
                              {(user.status === 'suspended' || user.status === 'banned') && (
                                <DropdownMenuItem 
                                  className="text-green-600 focus:text-green-700 focus:bg-green-100"
                                  onClick={() => openActionDialog('unban', user)}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Restore User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No users found matching your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

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
