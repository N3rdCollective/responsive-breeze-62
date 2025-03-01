
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Edit, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import { Search } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  featured_image: string | null;
  post_date: string;
  category: string | null;
  author: string | null;
  status: string;
  created_at: string;
}

interface NewsListTableProps {
  posts: Post[] | undefined;
  filteredPosts: Post[] | undefined;
  isLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  refetch: () => void;
}

const NewsListTable = ({
  posts,
  filteredPosts,
  isLoading,
  searchTerm,
  setSearchTerm,
  refetch
}: NewsListTableProps) => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="font-medium">Title</TableHead>
            <TableHead className="font-medium">Category</TableHead>
            <TableHead className="font-medium">Date</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium w-[180px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPosts && filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <TableRow key={post.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    {post.title}
                    <span className="text-xs text-muted-foreground">
                      By {post.author || "Unknown"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {post.category ? (
                    <Badge variant="outline" className="font-normal">
                      {post.category}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Uncategorized</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {format(new Date(post.post_date || post.created_at), "MMM dd, yyyy")}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={post.status === "published" ? "default" : "secondary"}
                    className={`${
                      post.status === "published" 
                        ? "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-800/30 dark:text-green-300" 
                        : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-800/30 dark:text-amber-300"
                    }`}
                  >
                    {post.status === "published" ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-2">
                    <Button
                      variant="ghost" 
                      size="icon"
                      onClick={() => navigate(`/news/${post.id}`)}
                      title="View post"
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/staff/news/edit/${post.id}`)}
                      title="Edit post"
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={post.status === "published" ? "secondary" : "default"}
                      size="sm"
                      onClick={() => publishPost(post.id, post.status)}
                      title={post.status === "published" ? "Unpublish" : "Publish"}
                      className="h-8 text-xs px-2"
                    >
                      {post.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deletePost(post.id)}
                      title="Delete post"
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-60 text-center">
                <div className="flex flex-col items-center justify-center gap-2 py-8">
                  {searchTerm ? (
                    <>
                      <Search className="h-8 w-8 text-muted-foreground/60" />
                      <p className="text-muted-foreground">No posts match your search</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSearchTerm("")}
                        className="mt-2"
                      >
                        Clear search
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground">No posts found</p>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate("/staff/news/edit")}
                        className="mt-4"
                      >
                        Create your first post
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default NewsListTable;
