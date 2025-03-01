
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import LoadingSpinner from "@/components/staff/LoadingSpinner";

interface PostFormData {
  title: string;
  content: string;
  category: string;
  featured_image: string | null;
  status: "draft" | "published";
}

const NewsEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { staffName, userRole, isLoading: authLoading } = useStaffAuth();
  const isAdmin = userRole === "admin";
  const isModerator = userRole === "moderator";
  const isNewPost = !id;
  
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
    category: "",
    featured_image: null,
    status: "draft",
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { isLoading, error } = useQuery({
    queryKey: ["news-post-edit", id],
    queryFn: async () => {
      if (isNewPost) return null;
      
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) {
        toast({
          title: "Error fetching post",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      setFormData({
        title: data.title,
        content: data.content,
        category: data.category || "",
        featured_image: data.featured_image,
        status: data.status,
      });
      
      if (data.featured_image) {
        setImagePreview(data.featured_image);
      }
      
      return data;
    },
    enabled: !isNewPost,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.featured_image;
    
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `news/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, imageFile);
      
    if (uploadError) {
      toast({
        title: "Error uploading image",
        description: uploadError.message,
        variant: "destructive",
      });
      return null;
    }
    
    const { data } = supabase.storage.from('media').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const savePost = async () => {
    try {
      setIsSaving(true);
      
      // Validate form
      if (!formData.title.trim()) {
        toast({
          title: "Title is required",
          variant: "destructive",
        });
        return;
      }
      
      // Upload image if exists
      let imageUrl = formData.featured_image;
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl && imageFile) return; // Upload failed
      }
      
      const postData = {
        title: formData.title,
        content: formData.content,
        category: formData.category || null,
        featured_image: imageUrl,
        status: formData.status,
        post_date: new Date().toISOString(),
        author: staffName,
      };
      
      let result;
      
      if (isNewPost) {
        // Create new post
        result = await supabase
          .from("posts")
          .insert(postData);
      } else {
        // Update existing post
        result = await supabase
          .from("posts")
          .update(postData)
          .eq("id", id);
      }
      
      if (result.error) {
        toast({
          title: `Error ${isNewPost ? 'creating' : 'updating'} post`,
          description: result.error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: `Post ${isNewPost ? 'created' : 'updated'} successfully`,
        description: `The post has been ${isNewPost ? 'created' : 'updated'}.`,
      });
      
      navigate("/staff/news");
    } catch (err) {
      toast({
        title: "An error occurred",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
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
              onClick={() => navigate('/staff/news')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to News Management
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold">
              {isNewPost ? "Create New Post" : "Edit Post"}
            </h1>
          </div>
          
          <Button 
            onClick={savePost}
            disabled={isSaving}
            className="flex items-center gap-1"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Post
              </>
            )}
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-destructive">Error loading post</h3>
            <p className="text-muted-foreground mt-2">Please try again later</p>
            <Button 
              variant="outline" 
              onClick={() => navigate("/staff/news")}
              className="mt-4"
            >
              Back to News Management
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter post title"
                      className="text-lg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="Write your post content here..."
                      className="min-h-[300px] resize-y"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="status" className="block mb-2">Status</Label>
                    <div className="flex gap-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="draft"
                          name="status"
                          value="draft"
                          checked={formData.status === "draft"}
                          onChange={() => setFormData(prev => ({ ...prev, status: "draft" }))}
                          className="mr-2"
                        />
                        <Label htmlFor="draft" className="cursor-pointer">Draft</Label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="published"
                          name="status"
                          value="published"
                          checked={formData.status === "published"}
                          onChange={() => setFormData(prev => ({ ...prev, status: "published" }))}
                          className="mr-2"
                        />
                        <Label htmlFor="published" className="cursor-pointer">Published</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="Enter category"
                    />
                    <p className="text-xs text-muted-foreground">Leave empty for uncategorized</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="featured_image">Featured Image</Label>
                    
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="mx-auto max-h-[200px] object-cover rounded"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setImageFile(null);
                              setFormData(prev => ({ ...prev, featured_image: null }));
                            }}
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center gap-2 cursor-pointer">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Click to upload image
                          </span>
                          <input
                            type="file"
                            id="featured_image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default NewsEditor;
