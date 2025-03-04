
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { Post } from "../types/newsTypes";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAuth } from "@/hooks/useStaffAuth";

interface NewsTableActionsProps {
  post: Post;
  onRefetch: () => void;
}

const NewsTableActions: React.FC<NewsTableActionsProps> = ({ post, onRefetch }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRole } = useStaffAuth();
  
  // Check if user has permission to delete posts
  const canDeletePost = userRole === 'admin' || userRole === 'super_admin' || userRole === 'moderator';
  
  const handleEdit = () => {
    console.log("Navigating to edit post with ID:", post.id);
    navigate(`/staff/news/edit/${post.id}`);
  };
  
  const handleView = () => {
    navigate(`/news/${post.id}`);
  };
  
  const handleDelete = async () => {
    // Check for delete permissions
    if (!canDeletePost) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to delete posts",
        variant: "destructive",
      });
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }
    
    console.log("Attempting to delete post with ID:", post.id);
    
    try {
      // Execute the delete operation with detailed logging
      console.log("Sending delete request to Supabase for post ID:", post.id);
      
      // Make sure we're using the correct FROM and WHERE clauses
      const { error, data } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id);
      
      console.log("Delete response from Supabase:", { error, data });
      
      if (error) {
        console.error("Supabase error deleting post:", error);
        throw error;
      }
      
      console.log("Post deleted successfully from database");
      
      // Show success toast
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted",
      });
      
      // Call the refetch function to update the UI
      console.log("Calling onRefetch function with type:", typeof onRefetch);
      if (typeof onRefetch === 'function') {
        try {
          await onRefetch();
          console.log("Refetch completed after delete");
        } catch (refetchError) {
          console.error("Error during refetch after delete:", refetchError);
        }
      } else {
        console.error("onRefetch is not a function:", onRefetch);
      }
    } catch (error: any) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: `Failed to delete post: ${error.message}`,
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="flex space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleEdit}
        title="Edit"
        className="hover:bg-secondary hover:text-secondary-foreground"
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleView}
        title="View"
        className="hover:bg-secondary hover:text-secondary-foreground"
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        title="Delete"
        className="text-red-500 hover:text-red-100 hover:bg-red-700 dark:hover:text-red-100 dark:hover:bg-red-700"
        disabled={!canDeletePost}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default NewsTableActions;
