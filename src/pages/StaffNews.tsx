
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Eye, Filter, Plus, Search, Trash2 } from "lucide-react";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { format } from "date-fns";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  const [searchTerm, setSearchTerm] = useState("");
  
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

  const filteredPosts = posts?.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (post.category && post.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      <main className="pt-20 pb-16 container mx-auto px-4 max-w-7xl">
        <div className="flex items-center mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/staff-panel')}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">News Management</h1>
            <p className="text-muted-foreground mt-1">Manage and publish news content for your website</p>
          </div>
          
          <Button 
            onClick={() => navigate("/staff/news/edit")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>
        
        <Card className="bg-card shadow-sm border-border/40">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative w-full md:w-1/2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts by title or category..."
                  className="pl-9 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Total: {posts?.length || 0} posts</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
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
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default StaffNews;
