import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Eye, User } from "lucide-react";
import { format } from "date-fns";
import ImageUploader from "./ImageUploader";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import RichTextEditor from "./RichTextEditor";
import PreviewModal from "./PreviewModal";

export type NewsStatus = "published" | "draft";

interface NewsFormProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  excerpt: string; 
  setExcerpt: (excerpt: string) => void;
  status: NewsStatus;
  setStatus: (status: NewsStatus) => void;
  currentFeaturedImageUrl: string;
  onImageSelected: (file: File) => void;
  onSave: () => void;
  isSaving: boolean;
  isUploading: boolean;
  isPreviewModalOpen?: boolean;
  setIsPreviewModalOpen?: (isOpen: boolean) => void;
  authorName?: string;
}

const NewsForm: React.FC<NewsFormProps> = ({
  title,
  setTitle,
  content,
  setContent,
  excerpt,
  setExcerpt,
  status,
  setStatus,
  currentFeaturedImageUrl,
  onImageSelected,
  onSave,
  isSaving,
  isUploading,
  isPreviewModalOpen = false,
  setIsPreviewModalOpen = () => {},
  authorName = "Staff Author"
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("edit");
  
  const handleOpenPreview = () => {
    setIsPreviewModalOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="edit" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
            />
          </div>
          
          <div>
            <Label htmlFor="excerpt">Excerpt (optional)</Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of the post"
              className="h-20"
            />
          </div>
          
          <RichTextEditor
            id="content"
            label="Content"
            value={content}
            onChange={setContent}
          />
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value: NewsStatus) => setStatus(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <ImageUploader 
            currentImageUrl={currentFeaturedImageUrl}
            onImageSelected={onImageSelected}
          />
          
          <div className="flex justify-end">
            <Button 
              type="button"
              variant="outline"
              onClick={handleOpenPreview}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" /> Preview in Modal
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="preview">
          <Card className="border rounded-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="relative">
                {currentFeaturedImageUrl && (
                  <div className="w-full h-[300px] overflow-hidden">
                    <img
                      src={currentFeaturedImageUrl}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h1 className="text-3xl font-bold mb-4">{title || "Post Title"}</h1>
                
                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={new Date().toISOString()}>
                      {format(new Date(), "MMMM dd, yyyy")}
                    </time>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Staff Author</span>
                  </div>
                </div>
                
                {excerpt && (
                  <div className="text-lg text-muted-foreground mb-6 italic">
                    {excerpt}
                  </div>
                )}
                
                <div 
                  className="prose prose-lg max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>This is a preview of how your post will appear when published.</p>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          variant="outline"
          onClick={() => navigate("/staff/news")}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={isSaving || isUploading}
        >
          {isSaving ? (
            <>
              <LoadingSpinner />
              <span className="ml-2">Saving...</span>
            </>
          ) : (
            "Save Post"
          )}
        </Button>
      </div>
      
      <PreviewModal
        isOpen={isPreviewModalOpen}
        onOpenChange={setIsPreviewModalOpen}
        title={title}
        content={content}
        excerpt={excerpt}
        featuredImageUrl={currentFeaturedImageUrl}
        authorName={authorName}
      />
    </div>
  );
};

export default NewsForm;
