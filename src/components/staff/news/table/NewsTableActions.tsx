import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { Post } from "../types/newsTypes";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { ROLE_PERMISSIONS, StaffRole } from "../../manage-staff/types/pendingStaffTypes";

interface NewsTableActionsProps {
  post: Post;
  onRefetch: () => void;
}

const NewsTableActions: React.FC<NewsTableActionsProps> = ({ post, onRefetch }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRole } = useStaffAuth();
  
  // Get permissions with proper type casting and default values
  const permissions = userRole && Object.keys(ROLE_PERMISSIONS).includes(userRole) 
    ? ROLE_PERMISSIONS[userRole as StaffRole]
    : {
        canManageStaff: false,
        canManageAllContent: false,
        canApproveContent: false,
        canPublishContent: false,
        canAssignRoles: false
      };
  
  // Check if user has permission to delete posts
  const canDeletePost = 
    userRole === 'admin' || 
    userRole === 'super_admin' || 
    userRole === 'moderator' ||
    userRole === 'content_manager';
  
  // Check if user has permission to edit posts
  const canEditPost = 
    canDeletePost || 
    userRole === 'blogger' || 
    permissions.canManageAllContent === true;
  
  console.log("NewsTableActions - Current user role:", userRole);
  console.log("NewsTableActions - Can delete post:", canDeletePost);
  console.log("NewsTableActions - Can edit post:", canEditPost);
  
  const handleEdit = () => {
    console.log("Navigating to edit post with ID:", post.id);
    navigate(`/staff/news/editor/${post.id}`);
  };
  
  const handleView = () => {
    navigate(`/news/${post.id}`);
  };
  
  const handleDelete = async () => {
    if (!canDeletePost) {
      console.error("Permission denied: User role", userRole, "cannot delete posts");
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
    console.log("User role performing delete:", userRole);
    
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error("Authentication error:", sessionError);
        toast({
          title: "Authentication error",
          description: "Please log in again to perform this action",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Authenticated as:", sessionData.session.user.email);
      console.log("Auth ID:", sessionData.session.user.id);
      
      console.log("Sending delete request to Supabase for post ID:", post.id);
      
      console.log("Post ID type:", typeof post.id);
      console.log("Post ID value:", post.id);
      
      const { error, data } = await supabase
        .from("posts")
        .delete()
        .eq("id", post.id)
        .select();
      
      console.log("Delete response from Supabase:", { error, data });
      
      if (error) {
        console.error("Supabase error deleting post:", error);
        
        if (error.message.includes("permission") || error.code === "42501") {
          toast({
            title: "Permission error",
            description: `You don't have permission to delete this post. Error: ${error.message}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to delete post: ${error.message}`,
            variant: "destructive",
          });
        }
        return;
      }
      
      console.log("Post deleted successfully from database");
      
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted",
      });
      
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
      {canEditPost && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEdit}
          title="Edit"
          className="hover:bg-secondary hover:text-secondary-foreground"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleView}
        title="View"
        className="hover:bg-secondary hover:text-secondary-foreground"
      >
        <Eye className="h-4 w-4" />
      </Button>
      
      {canDeletePost && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          title="Delete"
          className="text-red-500 hover:text-red-100 hover:bg-red-700 dark:hover:text-red-100 dark:hover:bg-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default NewsTableActions;
