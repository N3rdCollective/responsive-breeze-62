
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import TitleUpdater from "@/components/TitleUpdater";
import { useStaffActivityLogger } from "@/hooks/useStaffActivityLogger";
import UserActionsSection from "@/components/staff/user-manager/UserActionsSection";

interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  email: string | null;
  bio: string | null;
  status: 'active' | 'suspended' | 'banned';
  role: 'user' | 'moderator' | 'admin';
  is_public: boolean | null;
  forum_signature: string | null;
  created_at: string;
  forum_post_count?: number;
  timeline_post_count?: number;
}

interface FormData {
  username: string;
  display_name: string;
  email: string;
  bio: string;
  status: 'active' | 'suspended' | 'banned';
  role: 'user' | 'moderator' | 'admin';
  is_public: boolean;
  forum_signature: string;
}

const StaffUserEditor = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { userRole, isLoading: authLoading } = useStaffAuth();
  const { toast } = useToast();
  const { logActivity } = useStaffActivityLogger();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    display_name: '',
    email: '',
    bio: '',
    status: 'active',
    role: 'user',
    is_public: true,
    forum_signature: ''
  });

  const isAuthorized = !authLoading && userRole && ['admin', 'super_admin'].includes(userRole);

  const refreshUserData = async () => {
    if (!userId || !isAuthorized) return;
    
    try {
      console.log(`[StaffUserEditor] Refreshing user data for ${userId}`);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[StaffUserEditor] Error refreshing user:', error);
        throw error;
      }

      console.log('[StaffUserEditor] User data refreshed:', data);

      const userProfile: UserProfile = {
        id: data.id,
        username: data.username,
        display_name: data.display_name,
        email: data.email,
        bio: data.bio,
        status: (data.status as 'active' | 'suspended' | 'banned') || 'active',
        role: (data.role as 'user' | 'moderator' | 'admin') || 'user',
        is_public: data.is_public,
        forum_signature: data.forum_signature,
        created_at: data.created_at,
        forum_post_count: data.forum_post_count,
        timeline_post_count: data.timeline_post_count
      };

      setUser(userProfile);
      setFormData({
        username: userProfile.username || '',
        display_name: userProfile.display_name || '',
        email: userProfile.email || '',
        bio: userProfile.bio || '',
        status: userProfile.status,
        role: userProfile.role,
        is_public: userProfile.is_public ?? true,
        forum_signature: userProfile.forum_signature || ''
      });
    } catch (error: any) {
      console.error('[StaffUserEditor] Error refreshing user data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh user data",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!userId || !isAuthorized) return;
    
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;

        // Properly type cast the received data
        const userProfile: UserProfile = {
          id: data.id,
          username: data.username,
          display_name: data.display_name,
          email: data.email,
          bio: data.bio,
          status: (data.status as 'active' | 'suspended' | 'banned') || 'active',
          role: (data.role as 'user' | 'moderator' | 'admin') || 'user',
          is_public: data.is_public,
          forum_signature: data.forum_signature,
          created_at: data.created_at,
          forum_post_count: data.forum_post_count,
          timeline_post_count: data.timeline_post_count
        };

        setUser(userProfile);
        setFormData({
          username: userProfile.username || '',
          display_name: userProfile.display_name || '',
          email: userProfile.email || '',
          bio: userProfile.bio || '',
          status: userProfile.status,
          role: userProfile.role,
          is_public: userProfile.is_public ?? true,
          forum_signature: userProfile.forum_signature || ''
        });
      } catch (error: any) {
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
  }, [userId, isAuthorized, toast]);

  const handleSave = async () => {
    if (!user || !userId) return;

    setSaving(true);
    try {
      console.log('[StaffUserEditor] Saving user profile data:', formData);
      
      // Update the user profile in the database
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: formData.username || null,
          display_name: formData.display_name || null,
          email: formData.email || null,
          bio: formData.bio || null,
          status: formData.status,
          role: formData.role,
          is_public: formData.is_public,
          forum_signature: formData.forum_signature || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('[StaffUserEditor] Database update error:', error);
        throw error;
      }

      console.log('[StaffUserEditor] User profile updated successfully:', data);

      // Log the activity
      await logActivity(
        'edit_user',
        `User profile updated: ${formData.username || formData.display_name}`,
        'user',
        userId,
        {
          previous: user,
          updated: formData
        }
      );

      toast({
        title: "Success",
        description: "User profile updated successfully"
      });

      // Update local state with the saved data
      const updatedUser: UserProfile = {
        ...user,
        username: data.username,
        display_name: data.display_name,
        email: data.email,
        bio: data.bio,
        status: data.status as 'active' | 'suspended' | 'banned',
        role: data.role as 'user' | 'moderator' | 'admin',
        is_public: data.is_public,
        forum_signature: data.forum_signature
      };
      setUser(updatedUser);

    } catch (error: any) {
      console.error('[StaffUserEditor] Error updating user:', error);
      toast({
        title: "Error",
        description: `Failed to update user profile: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have permission to access this page.</p>
          <Button onClick={() => navigate('/staff/panel')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
          <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/staff/users')}>Back to Users</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <TitleUpdater title="Edit User - Staff Panel" />
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto px-4 py-20">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/staff/users')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
            <h1 className="text-3xl font-bold">Edit User Profile</h1>
            <p className="text-muted-foreground">
              Editing profile for {user?.display_name || user?.username}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Information Card */}
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter username"
                    />
                  </div>

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
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: 'active' | 'suspended' | 'banned') => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value: 'user' | 'moderator' | 'admin') => 
                      setFormData(prev => ({ ...prev, role: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_public"
                        checked={formData.is_public}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
                      />
                      <Label htmlFor="is_public">Public Profile</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Enter user bio"
                    rows={4}
                  />
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

                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/staff/users')}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* User Actions Card */}
            {user && (
              <UserActionsSection 
                user={user} 
                onUserUpdated={refreshUserData}
              />
            )}
          </div>

          {/* User Statistics Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>User Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{user?.forum_post_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Forum Posts</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{user?.timeline_post_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Timeline Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default StaffUserEditor;
