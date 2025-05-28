import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
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
  author_id?: string | null;
  updated_at?: string;
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
    author_id: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && postId) {
      loadPost(postId);
    } else if (!isEditing && staffId) {
      setPost(prev => ({ ...prev, author_id: staffId }));
    }
  }, [isEditing, postId, staffId]);

  const loadPost = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*, author_profile:staff!author(display_name, first_name)')
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
          author_id: data.author || null,
          updated_at: data.updated_at,
        };
        setPost(loadedPostData);
      }
    } catch (error) {
      console.error('Error loading post:', error);
      toast({
        title: "Error",
        description: "Failed to load post. It might not exist or there was a network issue.",
        variant: "destructive"
      });
      navigate('/staff/news');
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
      
      const supabasePostData = {
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        featured_image: post.featured_image,
        category: post.category,
        status: newStatus,
        author: staffId,
        author_name: staffName,
        post_date: new Date(post.post_date).toISOString(),
        updated_at: new Date().toISOString(),
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading Editor...</p>
        </div>
      </div>
    );
  }
  
  if (!userRole || !['admin', 'editor', 'staff', 'super_admin', 'moderator'].includes(userRole)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 bg-card rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-destructive">Access Denied</h2>
          <p className="mb-6">You do not have permission to access this page.</p>
          <Button onClick={() => navigate('/')}>Go to Homepage</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <TitleUpdater title={isEditing ? `Edit Post: ${post.title || 'Untitled'}` : "Create New Post"} />
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
              disabled={isSaving || !staffId}
              size="sm"
            >
              <Save className="h-4 w-4 mr-1.5" />
              {isSaving && post.status === 'draft' ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              onClick={() => handleSave('published')}
              disabled={isSaving || !staffId}
              size="sm"
            >
              <Eye className="h-4 w-4 mr-1.5" />
              {isSaving && post.status === 'published' ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Article Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={post.title}
                    onChange={(e) => updatePostField('title', e.target.value)}
                    placeholder="Enter article title"
                    className="text-lg font-medium"
                  />
                </div>
                
                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={post.excerpt}
                    onChange={(e) => updatePostField('excerpt', e.target.value)}
                    placeholder="Brief description for article previews"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={post.content}
                    onChange={(e) => updatePostField('content', e.target.value)}
                    placeholder="Write your article content here..."
                    rows={15}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Article Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={post.status} onValueChange={(value: NewsPost['status']) => updatePostField('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={post.category} onValueChange={(value) => updatePostField('category', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="interviews">Interviews</SelectItem>
                      <SelectItem value="announcements">Announcements</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="post_date">Publish Date</Label>
                  <Input
                    id="post_date"
                    type="date"
                    value={post.post_date}
                    onChange={(e) => updatePostField('post_date', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Author Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{staffName}</Badge>
                  <span className="text-sm text-muted-foreground">Current Author</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
};

export default StaffNewsEditor;
