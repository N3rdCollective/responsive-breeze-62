import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import RichTextEditor from "@/components/news/editor/RichTextEditor";
import { useForum } from "@/hooks/useForum";
import { ForumCategory } from "@/types/forum";

const NewForumTopicPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { createTopic, submitting } = useForum();
  
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // Content will now be HTML string
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categorySlug) return;
      
      try {
        setLoading(true);
        
        // Fetch category
        const { data, error } = await supabase
          .from('forum_categories')
          .select('*')
          .eq('slug', categorySlug)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          navigate('/members');
          toast({
            title: "Category not found",
            description: "The forum category you're looking for doesn't exist.",
            variant: "destructive"
          });
          return;
        }
        
        setCategory(data);
      } catch (error: any) {
        console.error('Error fetching category:', error.message);
        toast({
          title: "Error loading category",
          description: "We couldn't load the category data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategory();
  }, [categorySlug, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your topic.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if content is empty or just empty HTML like <p></p>
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    if (!content.trim() || !tempDiv.textContent?.trim()) {
      toast({
        title: "Content required",
        description: "Please enter content for your topic.",
        variant: "destructive"
      });
      return;
    }
    
    if (!category) return;
    
    const result = await createTopic({
      category_id: category.id,
      title,
      content // Pass HTML content
    });
    
    if (result) {
      navigate(`/members/forum/${categorySlug}/${result.slug || result.id}`);
    }
  };
  
  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 px-4 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in the useEffect
  }
  
  if (!category) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium mb-2">Category not found</p>
              <p className="text-muted-foreground mb-4">
                The forum category you're looking for doesn't exist.
              </p>
              <Button asChild>
                <Link to="/members">Back to Forum</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2">
              Create New Topic
            </h1>
            <div className="text-sm text-muted-foreground">
              Posting in <Link to={`/members/forum/${category.slug}`} className="text-primary hover:underline">{category.name}</Link>
            </div>
          </div>
          
          <div className="mb-6">
            <Link to={`/members/forum/${category.slug}`} className="text-sm text-primary hover:underline">
              &larr; Back to {category.name}
            </Link>
          </div>
          
          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80">
              <CardTitle>New Topic Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">Topic Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a title for your topic"
                      className="mt-1 border-primary/20 focus-visible:ring-primary"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    {/* Using RichTextEditor for content */}
                    <RichTextEditor
                      id="content"
                      value={content}
                      onChange={setContent}
                      label="Content"
                      height={300} // Adjusted height for forum context
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/members/forum/${category.slug}`)}
                      disabled={submitting}
                      className="border-primary/20"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={submitting || !title.trim() || !content.trim()} // Basic check, refined in handleSubmit
                      className="bg-primary hover:bg-primary/90"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Topic...
                        </>
                      ) : (
                        'Create Topic'
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewForumTopicPage;
