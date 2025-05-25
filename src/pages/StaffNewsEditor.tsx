import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
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
  User,
  Tag
} from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";

interface NewsPost {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image?: string | null;
  category: string;
  status: 'draft' | 'published' | 'archived';
  post_date: string;
  author_id?: string | null; // This will store the staffId (UUID)
  updated_at?: string;
  // author_name is not part of this interface as it's fetched or known via staffName
}

const StaffNewsEditor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { postId: postIdFromParams } = useParams<{ postId?: string }>();
  const { staffName, userRole, isLoading: authLoading, staffId } = useStaffAuth(); 
  const { toast } = useToast();
  
  const postIdFromQuery = searchParams.get('id');
  const postId = postIdFromParams || postIdFromQuery;
  const isEditing = !!postId;
  
  const [post, setPost] = useState<NewsPost>({
    title: '',
    content: '',
    excerpt: '',
    featured_image: null,
    category: 'general',
    status: 'draft',
    post_date: new Date().toISOString().split('T')[0],
    author_id: null, // Initialize author_id
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && postId) {
      loadPost(postId);
    } else if (!isEditing && staffId) {
      // For new posts, pre-fill author_id if staffId is available
      setPost(prev => ({ ...prev, author_id: staffId }));
    }
  }, [isEditing, postId, staffId]); // Added staffId dependency

  const loadPost = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*, author_profile:staff!author(display_name, first_name)') // Fetch author name if 'author' is FK to 'staff.id'
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const loadedPostData: NewsPost = {
          id: data.id,
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          featured_image: data.featured_image || null,
          category: data.category,
          status: data.status as NewsPost['status'],
          post_date: data.post_date ? new Date(data.post_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          author_id: data.author || null, // Corrected: map `data.author` to `author_id`
          updated_at: data.updated_at,
        };
        setPost(loadedPostData);
        // If author_name is needed for display and not available through staffName,
        // you might need to fetch it separately or adjust useStaffAuth if it provides author details by ID.
        // For now, we rely on `staffName` from `useStaffAuth` for the current editor.
      }
    } catch (error) {
      console.error('Error loading post:', error);
      toast({
        title: "Error",
        description: "Failed to load post. It might not exist or there was a network issue.",
        variant: "destructive"
      });
      navigate('/staff/news'); // Changed from /staff/panel to /staff/news for consistency
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (newStatus: NewsPost['status']) => {
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
    if (!staffId) {
      toast({
        title: "Authentication Error",
        description: "Cannot save post, staff member ID is missing. Please re-login.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Data to be sent to Supabase. Ensure field names match table columns.
      const supabasePostData = {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        featured_image: post.featured_image,
        category: post.category,
        status: newStatus,
        author: staffId, // Corrected: use 'author' for Supabase table column, assign staffId
        author_name: staffName, // Store current staffName as author_name
        post_date: new Date(post.post_date).toISOString(),
        updated_at: new Date().toISOString(),
        // `id` is not included here; it's used in `.eq()` for updates or handled by DB for inserts.
      };
      
      let result;
      if (isEditing && postId) {
        result = await supabase
          .from('posts')
          .update(supabasePostData)
          .eq('id', postId)
          .select()
          .single();
      } else {
        // For new posts, Supabase will generate the ID.
        // We can also add `created_at` here if it's not set by default in DB.
        // supabasePostData.created_at = new Date().toISOString(); // If needed
        result = await supabase
          .from('posts')
          .insert([supabasePostData])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Post ${isEditing ? 'updated' : 'created'} as ${newStatus}.`,
      });

      navigate('/staff/news');
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

  const updatePostField = (field: keyof NewsPost, value: string | null | NewsPost['status']) => {
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
      <TitleUpdater title={isEditing ? `Edit Post: ${post.title || 'Untitled'}` : "Create New Post"} />
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 pt-20 pb-16">
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
                  {isEditing ? `Editing "${post.title || 'Untitled'}"` : 'Craft a new article for the site.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => handleSave('draft')}
                disabled={isSaving || !staffId} // Disable if no staffId
                size="sm"
              >
                <Save className="h-4 w-4 mr-1.5" />
                {isSaving && post.status === 'draft' ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button 
                onClick={() => handleSave('published')}
                disabled={isSaving || !staffId} // Disable if no staffId
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
                      rows={18} 
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
                    <Tag className="h-5 w-5" /> 
                    Details & Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status" className="font-semibold">Status</Label>
                    <Select 
                      value={post.status} 
                      onValueChange={(value: NewsPost['status']) => updatePostField('status', value)}
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
                    {/* Display staffName (current editor) or fetched author name for existing posts */}
                    <span className="text-sm font-medium">{staffName || 'Not Logged In'}</span>
                  </div>
                   {isEditing && post.author_id && post.author_id !== staffId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Original author ID: {post.author_id.substring(0,8)}... (You are editing as {staffName || 'current user'})
                    </p>
                  )}
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
