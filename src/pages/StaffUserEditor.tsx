import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStaffRole } from "@/hooks/useStaffRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  ArrowLeft,
  Save,
  CheckCircle,
  Clock,
  Ban,
  UserX,
  Mail,
  Shield
} from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";
import { supabase } from "@/integrations/supabase/client";
import type { UserManagementUser } from "@/hooks/admin/useUserManagement";
import { useUserManagement } from "@/hooks/admin/useUserManagement";
import { useOptimizedUserManagerDialogs } from "@/hooks/admin/useOptimizedUserManagerDialogs";
import UserActionDialog from "@/components/staff/user-manager/UserActionDialog";
import UserMessageDialog from "@/components/staff/user-manager/UserMessageDialog";

const StaffUserEditor = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { userRole, isLoading: authLoading } = useStaffRole();
  const { toast } = useToast();

  // Use the user management hook for moderation functions
  const {
    updateUserStatus,
    sendUserMessage
  } = useUserManagement();

  // Use the optimized dialogs hook for moderation actions
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
  } = useOptimizedUserManagerDialogs(updateUserStatus, sendUserMessage);

  const [user, setUser] = useState<UserManagementUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    username: '',
    email: '',
    role: 'user' as 'user' | 'moderator' | 'admin',
    status: 'active' as 'active' | 'suspended' | 'banned',
    forum_signature: ''
  });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            email,
            username,
            display_name,
            status,
            role,
            created_at,
            last_active,
            profile_picture,
            forum_signature,
            forum_post_count,
            timeline_post_count,
            pending_report_count
          `)
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching user:', error);
          toast({
            title: "Error",
            description: "Failed to load user data",
            variant: "destructive"
          });
          return;
        }

        if (data) {
          const userData = {
            ...data,
            forum_post_count: data.forum_post_count || 0,
            timeline_post_count: data.timeline_post_count || 0,
            pending_report_count: data.pending_report_count || 0,
            email: data.email || 'N/A'
          } as UserManagementUser;

          setUser(userData);
          setFormData({
            display_name: userData.display_name || '',
            username: userData.username || '',
            email: userData.email || '',
            role: userData.role || 'user',
            status: userData.status || 'active',
            forum_signature: userData.forum_signature || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, toast]);

  const handleSave = async () => {
    if (!userId || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name.trim() || null,
          username: formData.username.trim() || null,
          role: formData.role,
          status: formData.status,
          forum_signature: formData.forum_signature.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user:', error);
        toast({
          title: "Error",
          description: "Failed to update user",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "User updated successfully"
      });

      // Update local user state
      setUser(prev => prev ? {
        ...prev,
        display_name: formData.display_name || null,
        username: formData.username || null,
        role: formData.role,
        status: formData.status,
        forum_signature: formData.forum_signature || null
      } : null);

    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      active: { variant: 'default' as const, icon: CheckCircle, text: 'Active', className: 'bg-green-500 hover:bg-green-600' },
      suspended: { variant: 'secondary' as const, icon: Clock, text: 'Suspended', className: 'bg-yellow-500 hover:bg-yellow-600 text-black' },
      banned: { variant: 'destructive' as const, icon: Ban, text: 'Banned', className: '' }
    };
    const selectedConfig = config[status as keyof typeof config] || config.active;
    const { variant, icon: Icon, text, className } = selectedConfig;
    return (
      <Badge variant={variant} className={`flex items-center gap-1 ${className || ''}`}>
        <Icon className="h-3 w-3" />
        {text}
      </Badge>
    );
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-128px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userRole || !['admin', 'super_admin'].includes(userRole)) {
    return (
      <>
        <TitleUpdater title="Access Denied - Staff Panel" />
        <main className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You don't have permission to edit users.
              </p>
              <Button onClick={() => navigate('/staff/panel')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Staff Panel
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <TitleUpdater title="Edit User - Staff Panel" />
        <div className="flex items-center justify-center h-[calc(100vh-128px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading user data...</p>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <TitleUpdater title="User Not Found - Staff Panel" />
        <main className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">User Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                The user you're trying to edit could not be found.
              </p>
              <Button onClick={() => navigate('/staff/users')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to User Management
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <TitleUpdater title={`Edit ${user.display_name || user.username} - Staff Panel`} />
      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="order-2 sm:order-1">
            <Button variant="outline" size="sm" onClick={() => navigate('/staff/users')} className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to User Management
            </Button>
          </div>
          <div className="text-center sm:text-right order-1 sm:order-2 w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 justify-center sm:justify-end">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="break-words">Edit User</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Modify user details and permissions.
            </p>
          </div>
        </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.display_name || user.username || 'User'}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl font-medium text-muted-foreground">
                    {(user.display_name || user.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">{user.display_name || user.username}</h3>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(user.status)}
                  <Badge variant="outline">{user.role}</Badge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Forum Posts:</span> {user.forum_post_count}
              </div>
              <div>
                <span className="font-medium">Timeline Posts:</span> {user.timeline_post_count}
              </div>
              <div>
                <span className="font-medium">Pending Reports:</span> {user.pending_report_count}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moderation Actions Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Moderation Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openMessageDialog(user)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              
              {user.status === 'active' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                    onClick={() => openActionDialog('suspend', user)}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Suspend User
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => openActionDialog('ban', user)}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Ban User
                  </Button>
                </>
              )}
              
              {(user.status === 'suspended' || user.status === 'banned') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => openActionDialog('unban', user)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Restore User
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Edit User Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Enter display name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email"
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed from this interface</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value: 'user' | 'moderator' | 'admin') => setFormData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'suspended' | 'banned') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="forum_signature">Forum Signature</Label>
              <Textarea
                id="forum_signature"
                value={formData.forum_signature}
                onChange={(e) => setFormData(prev => ({ ...prev, forum_signature: e.target.value }))}
                placeholder="Enter forum signature"
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => navigate('/staff/users')}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Moderation Dialogs */}
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
    </>
  );
};

export default StaffUserEditor;
