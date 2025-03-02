
import { useNavigate } from "react-router-dom";
import { Edit, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface NewsTableActionsProps {
  postId: string;
  status: string;
  refetch: () => void;
}

const NewsTableActions = ({ postId, status, refetch }: NewsTableActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const deletePost = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id);
      
    if (error) {
      toast({
        title: "Error deleting post",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Post deleted",
      description: "The post has been successfully deleted.",
    });
    
    refetch();
  };

  const publishPost = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    
    const { error } = await supabase
      .from("posts")
      .update({ status: newStatus })
      .eq("id", id);
      
    if (error) {
      toast({
        title: "Error updating post",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: `Post ${newStatus === "published" ? "published" : "unpublished"}`,
      description: `The post has been ${newStatus === "published" ? "published" : "unpublished"}.`,
    });
    
    refetch();
  };

  return (
    <div className="flex justify-end items-center gap-2">
      <Button
        variant="ghost" 
        size="icon"
        onClick={() => navigate(`/news/${postId}`)}
        title="View post"
        className="h-8 w-8"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(`/staff/news/edit/${postId}`)}
        title="Edit post"
        className="h-8 w-8"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant={status === "published" ? "secondary" : "default"}
        size="sm"
        onClick={() => publishPost(postId, status)}
        title={status === "published" ? "Unpublish" : "Publish"}
        className="h-8 text-xs px-2"
      >
        {status === "published" ? "Unpublish" : "Publish"}
      </Button>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => deletePost(postId)}
        title="Delete post"
        className="h-8 w-8"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default NewsTableActions;
