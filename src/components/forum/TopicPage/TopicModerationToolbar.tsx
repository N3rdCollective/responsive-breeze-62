import React, { useState } from 'react';
import { Lock, Unlock, Pin, PinOff, Trash2, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ForumTopic } from '@/types/forum';

interface TopicModerationToolbarProps {
  topic: ForumTopic;
  onTopicUpdate: () => Promise<void>;
  userRole: string;
}

const TopicModerationToolbar: React.FC<TopicModerationToolbarProps> = ({ 
  topic, 
  onTopicUpdate, 
  userRole 
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletionStep, setDeletionStep] = useState('');
  const [deletionComplete, setDeletionComplete] = useState(false);

  const canModerate = userRole === 'admin' || userRole === 'super_admin' || userRole === 'moderator';

  if (!canModerate) {
    return null;
  }

  const toggleTopicSticky = async () => {
    setIsProcessing(true);
    try {
      const newStatus = !topic.is_sticky;
      
      console.log(`[TopicModerationToolbar] Toggling sticky status from ${topic.is_sticky} to ${newStatus} for topic ${topic.id}`);
      
      const { error } = await supabase
        .from("forum_topics")
        .update({ is_sticky: newStatus })
        .eq("id", topic.id);
      
      if (error) {
        console.error('[TopicModerationToolbar] Sticky toggle error:', error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: `Topic ${newStatus ? "pinned" : "unpinned"} successfully`,
      });
      
      console.log('[TopicModerationToolbar] Sticky toggle successful, refreshing topic data');
      await onTopicUpdate();
    } catch (err: any) {
      console.error('[TopicModerationToolbar] Error in toggleTopicSticky:', err);
      toast({
        title: "Error",
        description: `Failed to update topic: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleTopicLocked = async () => {
    setIsProcessing(true);
    try {
      const newStatus = !topic.is_locked;
      
      console.log(`[TopicModerationToolbar] Toggling lock status from ${topic.is_locked} to ${newStatus} for topic ${topic.id}`);
      
      const { error } = await supabase
        .from("forum_topics")
        .update({ is_locked: newStatus })
        .eq("id", topic.id);
      
      if (error) {
        console.error('[TopicModerationToolbar] Lock toggle error:', error);
        throw error;
      }
      
      toast({
        title: "Success",
        description: `Topic ${newStatus ? "locked" : "unlocked"} successfully`,
      });
      
      console.log('[TopicModerationToolbar] Lock toggle successful, refreshing topic data');
      await onTopicUpdate();
    } catch (err: any) {
      console.error('[TopicModerationToolbar] Error in toggleTopicLocked:', err);
      toast({
        title: "Error",
        description: `Failed to update topic: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyTopicDeletion = async (topicId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("forum_topics")
        .select("id")
        .eq("id", topicId)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // Topic not found, deletion successful
        return true;
      }
      
      // Topic still exists
      return false;
    } catch (err) {
      console.error('[TopicModerationToolbar] Error verifying deletion:', err);
      return false;
    }
  };

  const handleDeleteTopic = async () => {
    setIsProcessing(true);
    setDeletionStep('Preparing deletion...');
    setDeletionComplete(false);
    
    try {
      console.log(`[TopicModerationToolbar] Starting deletion of topic ${topic.id}`);
      
      // Step 1: Delete the topic
      setDeletionStep('Deleting topic...');
      await new Promise(resolve => setTimeout(resolve, 800)); // Brief delay for visual feedback
      
      const { error } = await supabase
        .from("forum_topics")
        .delete()
        .eq("id", topic.id);
      
      if (error) {
        console.error('[TopicModerationToolbar] Delete error:', error);
        throw error;
      }
      
      // Step 2: Verify deletion
      setDeletionStep('Verifying deletion...');
      console.log('[TopicModerationToolbar] Topic deletion command sent, verifying completion');
      
      let deletionVerified = false;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (!deletionVerified && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        deletionVerified = await verifyTopicDeletion(topic.id);
        attempts++;
        
        if (!deletionVerified) {
          console.log(`[TopicModerationToolbar] Deletion not yet complete, attempt ${attempts}/${maxAttempts}`);
          setDeletionStep(`Verifying deletion (${attempts}/${maxAttempts})...`);
        }
      }
      
      if (!deletionVerified) {
        console.warn('[TopicModerationToolbar] Could not verify deletion completion, but proceeding');
      }
      
      // Step 3: Update forum data
      setDeletionStep('Updating forum data...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 4: Finalize
      setDeletionStep('Finalizing...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 5: Success
      setDeletionStep('Deletion completed successfully!');
      setDeletionComplete(true);
      
      toast({
        title: "Success",
        description: "Topic deleted successfully",
      });
      
      // Brief pause to show success state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setDeleteDialogOpen(false);
      
      console.log('[TopicModerationToolbar] Topic deletion verified, waiting before navigation');
      
      // Additional delay to ensure all database triggers and counts are updated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('[TopicModerationToolbar] Navigating back to forum with enhanced cache-busting');
      
      // Enhanced cache-busting with multiple parameters
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const cacheParams = `refresh=${timestamp}&clear=${randomId}&updated=true&deleted=topic`;
      
      if (topic.category?.slug) {
        navigate(`/members/forum/${topic.category.slug}?${cacheParams}`, { replace: true });
      } else {
        navigate(`/members?${cacheParams}`, { replace: true });
      }
      
      // Force a hard refresh after navigation to clear any remaining cache
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (err: any) {
      console.error('[TopicModerationToolbar] Error in handleDeleteTopic:', err);
      toast({
        title: "Error",
        description: `Failed to delete topic: ${err.message}`,
        variant: "destructive",
      });
      setDeletionStep('');
      setDeletionComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const getDeletionStepIcon = () => {
    if (deletionComplete) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <Loader2 className="h-5 w-5 animate-spin" />;
  };

  return (
    <>
      <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
        <span className="text-sm font-medium text-amber-800 dark:text-amber-200 mr-2">
          Moderation:
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTopicSticky}
          disabled={isProcessing}
          title={topic.is_sticky ? "Unpin topic" : "Pin topic"}
          className="text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/50"
        >
          {topic.is_sticky ? <PinOff className="h-4 w-4 mr-1" /> : <Pin className="h-4 w-4 mr-1" />}
          {topic.is_sticky ? "Unpin" : "Pin"}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTopicLocked}
          disabled={isProcessing}
          title={topic.is_locked ? "Unlock topic" : "Lock topic"}
          className="text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/50"
        >
          {topic.is_locked ? <Unlock className="h-4 w-4 mr-1" /> : <Lock className="h-4 w-4 mr-1" />}
          {topic.is_locked ? "Unlock" : "Lock"}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={isProcessing}
          title="Delete topic"
          className="text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50"
        >
          {isProcessing && deletionStep ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 mr-1" />
          )}
          Delete
        </Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-destructive">
              Delete Topic Forever?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground">
              This will permanently delete the topic "{topic.title}" and all its posts.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {isProcessing && (
            <div className="py-6 border-y border-border/50">
              <div className="flex items-center gap-3 mb-3">
                {getDeletionStepIcon()}
                <span className="text-sm font-medium">
                  {deletionStep}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    deletionComplete 
                      ? 'bg-green-500 w-full' 
                      : 'bg-destructive w-1/2 animate-pulse'
                  }`}
                />
              </div>
              
              <div className="mt-3 text-xs text-muted-foreground">
                {deletionComplete 
                  ? "✓ Deletion completed successfully! Redirecting..." 
                  : "Please wait while we process the deletion..."
                }
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTopic}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </div>
              ) : (
                "Delete Forever"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Full-page overlay during deletion */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background border rounded-lg p-6 shadow-lg max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                {getDeletionStepIcon()}
              </div>
              <h3 className="text-lg font-semibold mb-2">Deleting Topic</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {deletionStep}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    deletionComplete 
                      ? 'bg-green-500 w-full' 
                      : 'bg-destructive w-1/2 animate-pulse'
                  }`}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {deletionComplete 
                  ? "Redirecting to forum..." 
                  : "Please do not close this page"
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopicModerationToolbar;
