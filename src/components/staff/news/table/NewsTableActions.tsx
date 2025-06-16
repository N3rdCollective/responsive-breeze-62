
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil, Eye, Trash2, Check, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useStaffActivityLogger } from "@/hooks/useStaffActivityLogger";
import { Post } from "../types/newsTypes";

interface NewsTableActionsProps {
  post: Post;
  onRefetch: () => void;
}

const NewsTableActions: React.FC<NewsTableActionsProps> = ({
  post,
  onRefetch
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { staffRole } = useAuth();
  const { logActivity } = useStaffActivityLogger();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const postId = post.id;
  const postTitle = post.title;
  const postStatus = post.status;
  
  const canModify = staffRole === 'admin' || staffRole === 'super_admin' || staffRole === 'moderator';
  const canPublish = canModify || staffRole === 'content_manager';

  const handleEdit = () => {
    console.log("[NewsTableActions] Edit button clicked for post:", postId);
    console.log("[NewsTableActions] Post details:", { id: postId, title: postTitle, status: postStatus });
    
    // Use the correct route that matches your App.tsx
    const editorRoute = `/staff/news/editor/${postId}`;
    console.log("[NewsTableActions] Navigating to editor with route:", editorRoute);
    
    try {
      navigate(editorRoute);
      console.log("[NewsTableActions] Navigation successful");
    } catch (error) {
      console.error("[NewsTableActions] Navigation error:", error);
      toast({
        title: "Navigation Error",
        description: "Failed to open editor. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleView = async () => {
    if (postStatus === 'published') {
      navigate(`/news/${postId}`);
    } else {
      toast({
        title: "Preview not available",
        description: "This post is not published yet",
      });
    }
  };

  const handleTogglePublish = async () => {
    if (!canPublish) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to publish/unpublish posts",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const newStatus = postStatus === 'published' ? 'draft' : 'published';
      const { error } = await supabase
        .from('posts')
        .update({ status: newStatus })
        .eq('id', postId);
        
      if (error) throw error;
      
      const actionType = newStatus === 'published' ? 'publish_post' : 'unpublish_post';
      const description = newStatus === 'published' 
        ? `Published post: ${postTitle}` 
        : `Unpublished post: ${postTitle}`;
      
      await logActivity(
        actionType,
        description,
        'post',
        postId,
        { newStatus, title: postTitle }
      );
      
      toast({
        title: "Success",
        description: `Post ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
      });
      
      onRefetch();
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast({
        title: "Error",
        description: `Failed to update post status: ${(error as any)?.message || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canModify) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete posts",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
        
      if (error) throw error;
      
      await logActivity(
        'delete_post',
        `Deleted post: ${postTitle}`,
        'post',
        postId,
        { title: postTitle, status: postStatus }
      );
      
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      
      setIsDeleteDialogOpen(false);
      onRefetch();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: `Failed to delete post: ${(error as any)?.message || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex space-x-1 justify-end">
        <Button variant="ghost" size="icon" onClick={handleEdit} title="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" onClick={handleView} title="View">
          <Eye className="h-4 w-4" />
        </Button>
        
        {canPublish && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleTogglePublish} 
            disabled={isLoading}
            title={postStatus === 'published' ? "Unpublish" : "Publish"}
          >
            {postStatus === 'published' ? (
              <X className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {canModify && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsDeleteDialogOpen(true)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post
              "{postTitle}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NewsTableActions;
