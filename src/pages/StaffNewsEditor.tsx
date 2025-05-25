
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom"; // Added useParams
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Save, 
  ArrowLeft, 
  FileText, 
  Eye, 
  // Calendar, // Calendar not used
  User,
  // Tag // Tag not used directly from lucide here, but as a component prop name
} from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater"; // Assuming this component exists and is correct

interface NewsPost {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image?: string | null; // Allow null
  category: string;
  status: 'draft' | 'published' | 'archived';
  post_date: string;
  author_id?: string | null; // Allow null
  updated_at?: string; // Add updated_at
}

const StaffNewsEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { postId: postIdFromParams } = useParams<{ postId?: string }>(); // For editor/:postId route
  const { staffName, userRole, isLoading: authLoading, user } = useStaffAuth(); // Assuming user object with id exists
  const { toast } = useToast();
  
  const postIdFromQuery = searchParams.get('id');
  const postId = postIdFromParams || postIdFromQuery; // Prioritize path param
  const isEditing = !!postId;
  
  const [post, setPost] = useState<NewsPost>({
    title: '',
    content: '',
    excerpt: '',
    featured_image: null,
    category: 'general', // Default category
    status: 'draft',
    post_date: new Date().toISOString().split('T')[0]
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && postId) {
      loadPost(postId);
    }
  }, [isEditing, postId]);

  const loadPost = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('posts') // Ensure 'posts' table exists
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setPost({
          ...data,
          post_date: data.post_date ? new Date(data.post_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          featured_image: data.featured_image || null,
        });
      }
    } catch (error) {
      console.error('Error loading post:', error);
      toast({
        title: "Error",
        description: "Failed to load post. It might not exist or there was a network issue.",
        variant: "destructive"
      });
      navigate('/staff/panel'); // Navigate to a general staff page
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (newStatus: 'draft' | 'published') => {
    if (!post.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required.",
        variant: "destructive"
      });
      return;
    }
    if (!post.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Content is required.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      const postData: Omit<NewsPost, 'id'> & { author_id?: string | null, updated_at: string, id?:string } = {
        ...post,
        status: newStatus,
        author_id: user?.id || null, // Set author_id from authenticated user
        post_date: new Date(post.post_date).toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (isEditing && postId) {
        postData.id = postId;
      }


      let result;
      if (isEditing && postId) {
        // Ensure we don't try to update the id itself if it's part of postData and matches postId
        const { id, ...updateData } = postData;
        result = await supabase
          .from('posts')
          .update(updateData)
          .eq('id', postId)
          .select()
          .single();
      } else {
        // For insert, remove 'id' if it's undefined or was part of the initial state
        const { id, ...insertData } = postData;
        result = await supabase
          .from('posts')
          .insert([insertData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Post ${isEditing ? 'updated' : 'created'} as ${newStatus}.`,
      });

      navigate('/staff/news'); // Navigate to news list page
    } catch (error) {
      console.error('Error saving post:', error);
      const errorMessage = (error as Error).message || "Failed to save post. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updatePostField = (field: keyof NewsPost, value: string | null) => { // Allow null for featured_image
    setPost(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-128px)]"> {/* Adjust height for navbar/footer */}
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Loading Editor...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Basic role check (adjust as needed for specific permissions)
  if (!userRole || !['admin', 'editor', 'staff', 'super_admin', 'moderator'].includes(userRole)) {
     return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-128px)]">
          <div className="text-center p-8 bg-card rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-destructive">Access Denied</h2>
            <p className="mb-6">You do not have permission to access this page.</p>
            <Button onClick={() => navigate('/')}>Go to Homepage</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <TitleUpdater title={isEditing ? `Edit Post: ${post.title}` : "Create New Post"} />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 pt-20 pb-16"> {/* Increased top padding */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/staff/news')}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to News List
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  {isEditing ? 'Edit Post' : 'New Post'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isEditing ? `Editing "${post.title}"` : 'Craft a new article for the site.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleSave('draft')}
                disabled={isSaving}
                size="sm"
              >
                <Save className="h-4 w-4 mr-1.5" />
                {isSaving && post.status === 'draft' ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button 
                onClick={() => handleSave('published')}
                disabled={isSaving}
                size="sm"
              >
                <Eye className="h-4 w-4 mr-1.5" />
                {isSaving && post.status === 'published' ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Main Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="font-semibold">Title</Label>
                    <Input
                      id="title"
                      value={post.title}
                      onChange={(e) => updatePostField('title', e.target.value)}
                      placeholder="Enter post title"
                      className="mt-1 text-lg"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="excerpt" className="font-semibold">Excerpt (Summary)</Label>
                    <Textarea
                      id="excerpt"
                      value={post.excerpt}
                      onChange={(e) => updatePostField('excerpt', e.target.value)}
                      placeholder="A brief summary of the post (optional)"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="content" className="font-semibold">Full Content</Label>
                    <Textarea
                      id="content"
                      value={post.content}
                      onChange={(e) => updatePostField('content', e.target.value)}
                      placeholder="Write your post content here. Markdown is supported."
                      rows={18} // Increased rows
                      className="mt-1"
                    />
                     <p className="text-xs text-muted-foreground mt-1">Markdown is supported for formatting.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-md">
                    {/* Using a generic Tag icon from lucide if available, or just text */}
                    <lucide-react.Tag className="h-5 w-5" /> 
                    Details & Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status" className="font-semibold">Status</Label>
                    <Select 
                      value={post.status} 
                      onValueChange={(value: 'draft' | 'published' | 'archived') => updatePostField('status', value)}
                    >
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="category" className="font-semibold">Category</Label>
                    <Select 
                      value={post.category} 
                      onValueChange={(value) => updatePostField('category', value)}
                    >
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General News</SelectItem>
                        <SelectItem value="music">Music Spotlight</SelectItem>
                        <SelectItem value="events">Upcoming Events</SelectItem>
                        <SelectItem value="interviews">Interviews</SelectItem>
                        <SelectItem value="community">Community Highlights</SelectItem>
                         <SelectItem value="station_updates">Station Updates</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="post_date" className="font-semibold">Publish Date</Label>
                    <Input
                      id="post_date"
                      type="date"
                      value={post.post_date}
                      onChange={(e) => updatePostField('post_date', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="featured_image" className="font-semibold">Featured Image URL (Optional)</Label>
                    <Input
                      id="featured_image"
                      value={post.featured_image || ''}
                      onChange={(e) => updatePostField('featured_image', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="mt-1"
                    />
                    {post.featured_image && (
                      <img src={post.featured_image} alt="Featured preview" className="mt-2 rounded-md max-h-32 object-cover" />
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-md">
                    <User className="h-5 w-5" />
                    Author
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">{userRole || 'N/A'}</Badge>
                    <span className="text-sm font-medium">{staffName || 'Not Logged In'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current Date: {new Date().toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default StaffNewsEditor;
