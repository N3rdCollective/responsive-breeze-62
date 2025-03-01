
import React from "react";
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
import ImageUploader from "./ImageUploader";
import LoadingSpinner from "@/components/staff/LoadingSpinner";
import { useNavigate } from "react-router-dom";

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
  isUploading
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
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
      
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your post content here"
          className="h-64"
        />
      </div>
      
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
    </div>
  );
};

export default NewsForm;
