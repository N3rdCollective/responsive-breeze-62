
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Eye, Plus, Trash2 } from "lucide-react";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { format } from "date-fns";
import LoadingSpinner from "@/components/staff/LoadingSpinner";

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

const StaffNews = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userRole, isLoading: authLoading } = useStaffAuth();
  const isAdmin = userRole === "admin";
  const isModerator = userRole === "moderator";
  
  const { data: posts, isLoading, error, refetch } = useQuery({
    queryKey: ["staff-news-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        toast({
          title: "Error fetching posts",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as Post[];
    },
  });

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

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin && !isModerator) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16 container mx-auto px-4">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-destructive mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
            <Button onClick={() => navigate('/staff-panel')}>
              Back to Staff Panel
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/staff-panel')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Staff Panel
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">News Management</h1>
          </div>
          
          <Button 
            onClick={() => navigate("/staff/news/edit")}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>
        
        <Card className="bg-card">
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-destructive">Error loading posts</h3>
              <p className="text-muted-foreground mt-2">Please try again later</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[180px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts && posts.length > 0 ? (
                    posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>{post.category || "Uncategorized"}</TableCell>
                        <TableCell>{format(new Date(post.post_date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            post.status === "published" 
                              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" 
                              : "bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100"
                          }`}>
                            {post.status === "published" ? "Published" : "Draft"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/news/${post.id}`)}
                            title="View post"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/staff/news/edit/${post.id}`)}
                            title="Edit post"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={post.status === "published" ? "outline" : "default"}
                            size="sm"
                            onClick={() => publishPost(post.id, post.status)}
                            title={post.status === "published" ? "Unpublish" : "Publish"}
                          >
                            {post.status === "published" ? "Unpublish" : "Publish"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deletePost(post.id)}
                            title="Delete post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <p className="text-muted-foreground">No posts found</p>
                        <Button 
                          variant="outline" 
                          onClick={() => navigate("/staff/news/edit")}
                          className="mt-4"
                        >
                          Create your first post
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default StaffNews;
