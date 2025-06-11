
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye, MessageSquare, Mail, UserX, Ban, UserCheck, ExternalLink, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserActions } from "@/hooks/admin/useUserActions";
import { useUserMessages } from "@/hooks/admin/useUserMessages";

interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  email: string | null;
  status: 'active' | 'suspended' | 'banned';
  role: 'user' | 'moderator' | 'admin';
}

interface UserActionsSectionProps {
  user: UserProfile;
  onUserUpdated: () => void;
}

const UserActionsSection: React.FC<UserActionsSectionProps> = ({ user, onUserUpdated }) => {
  const { toast } = useToast();
  const { updateUserStatus, loading: actionLoading } = useUserActions();
  const { sendUserMessage, loading: messageLoading } = useUserMessages();
  
  const [actionReason, setActionReason] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [showActionForm, setShowActionForm] = useState<'suspend' | 'ban' | 'unban' | null>(null);

  const handleViewProfile = () => {
    if (user.username) {
      window.open(`/profile/${user.id}`, '_blank');
    } else {
      toast({
        title: "Unable to view profile",
        description: "User doesn't have a username set",
        variant: "destructive"
      });
    }
  };

  const handleViewPosts = () => {
    // Navigate to forum with user filter - placeholder for now
    toast({
      title: "View Posts",
      description: `Would show posts by ${user.display_name || user.username}`,
    });
  };

  const handleSendMessage = async () => {
    if (!messageSubject.trim() || !messageContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both subject and message content",
        variant: "destructive"
      });
      return;
    }

    const success = await sendUserMessage(user.id, messageSubject, messageContent);
    if (success) {
      setMessageSubject('');
      setMessageContent('');
      setShowMessageForm(false);
      toast({
        title: "Message Sent",
        description: `Administrative message sent to ${user.display_name || user.username}`,
      });
    }
  };

  const handleUserAction = async (actionType: 'suspend' | 'ban' | 'unban') => {
    if (!actionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for this action",
        variant: "destructive"
      });
      return;
    }

    const newStatus = actionType === 'unban' ? 'active' : actionType === 'suspend' ? 'suspended' : 'banned';
    const success = await updateUserStatus(user.id, newStatus, actionReason, actionType);
    
    if (success) {
      setActionReason('');
      setShowActionForm(null);
      onUserUpdated();
      toast({
        title: "User Status Updated",
        description: `User has been ${actionType === 'unban' ? 'restored' : actionType + 'ed'} successfully`,
      });
    }
  };

  const getStatusBadge = (status: UserProfile['status']) => {
    const config = {
      active: { variant: 'default' as const, text: 'Active', className: 'bg-green-500 hover:bg-green-600' },
      suspended: { variant: 'secondary' as const, text: 'Suspended', className: 'bg-yellow-500 hover:bg-yellow-600 text-black' },
      banned: { variant: 'destructive' as const, text: 'Banned', className: '' }
    };
    const { variant, text, className } = config[status];
    return <Badge variant={variant} className={className}>{text}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          User Actions
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-muted-foreground">Status:</span>
            {getStatusBadge(user.status)}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* View Actions */}
        <div>
          <h4 className="font-medium mb-3">View & Browse</h4>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleViewProfile}>
              <Eye className="h-4 w-4 mr-2" />
              View Profile
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleViewPosts}>
              <MessageSquare className="h-4 w-4 mr-2" />
              View Posts
            </Button>
          </div>
        </div>

        <Separator />

        {/* Send Message */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Send Administrative Message</h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowMessageForm(!showMessageForm)}
            >
              <Mail className="h-4 w-4 mr-2" />
              {showMessageForm ? 'Cancel' : 'Send Message'}
            </Button>
          </div>
          
          {showMessageForm && (
            <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
              <div>
                <Label htmlFor="messageSubject">Subject</Label>
                <Input
                  id="messageSubject"
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Message subject"
                />
              </div>
              <div>
                <Label htmlFor="messageContent">Message</Label>
                <Textarea
                  id="messageContent"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your administrative message here..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowMessageForm(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSendMessage} disabled={messageLoading}>
                  {messageLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Account Status Actions */}
        <div>
          <h4 className="font-medium mb-3">Account Status Management</h4>
          <div className="space-y-3">
            {user.status === 'active' && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                  onClick={() => setShowActionForm('suspend')}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Suspend User
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => setShowActionForm('ban')}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Ban User
                </Button>
              </div>
            )}
            
            {(user.status === 'suspended' || user.status === 'banned') && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-green-600 border-green-300 hover:bg-green-50"
                onClick={() => setShowActionForm('unban')}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Restore User
              </Button>
            )}

            {showActionForm && (
              <div className="border rounded-lg p-4 bg-muted/20 space-y-3">
                <div>
                  <Label htmlFor="actionReason">
                    Reason for {showActionForm === 'unban' ? 'restoring' : showActionForm + 'ing'} user
                  </Label>
                  <Textarea
                    id="actionReason"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder={`Please provide a reason for ${showActionForm === 'unban' ? 'restoring' : showActionForm + 'ing'} this user...`}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    setShowActionForm(null);
                    setActionReason('');
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    variant={showActionForm === 'unban' ? 'default' : 'destructive'}
                    onClick={() => handleUserAction(showActionForm)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : showActionForm === 'suspend' ? (
                      <UserX className="h-4 w-4 mr-2" />
                    ) : showActionForm === 'ban' ? (
                      <Ban className="h-4 w-4 mr-2" />
                    ) : (
                      <UserCheck className="h-4 w-4 mr-2" />
                    )}
                    {showActionForm === 'unban' ? 'Restore User' : showActionForm.charAt(0).toUpperCase() + showActionForm.slice(1) + ' User'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserActionsSection;
