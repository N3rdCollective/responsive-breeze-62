
import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NewsStatus } from "../NewsForm";
import { Badge } from "@/components/ui/badge";
import { X, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const PREDEFINED_CATEGORIES = [
  "News",
  "Events",
  "Announcements",
  "Music",
  "Interviews",
  "Features",
  "Community",
  "Other"
];

interface NewsFormBasicFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  excerpt: string;
  setExcerpt: (excerpt: string) => void;
  status: NewsStatus;
  setStatus: (status: NewsStatus) => void;
  category: string;
  setCategory: (category: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  canPublish?: boolean;
}

const NewsFormBasicFields: React.FC<NewsFormBasicFieldsProps> = ({
  title,
  setTitle,
  excerpt,
  setExcerpt,
  status,
  setStatus,
  category,
  setCategory,
  tags,
  setTags,
  canPublish = false,
}) => {
  const [tagInput, setTagInput] = React.useState("");
  
  useEffect(() => {
    console.log("[NewsFormBasicFields] Current status:", status);
  }, [status]);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const handleExcerptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setExcerpt(e.target.value);
  };
  
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };
  
  const toggleStatus = () => {
    if (canPublish || status === "published") {
      const newStatus: NewsStatus = status === "published" ? "draft" : "published";
      console.log(`[NewsFormBasicFields] Explicitly setting status from ${status} to ${newStatus}`);
      setStatus(newStatus);
    }
  };
  
  return (
    <div className="space-y-6 text-foreground">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter post title"
          className="text-foreground bg-background"
        />
      </div>
      
      <div>
        <Label htmlFor="excerpt">Excerpt (optional)</Label>
        <Textarea
          id="excerpt"
          value={excerpt}
          onChange={handleExcerptChange}
          placeholder="Brief summary of the post"
          className="h-20 text-foreground bg-background"
        />
      </div>
      
      <div>
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="" disabled>Select a category</option>
          {PREDEFINED_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      <div>
        <Label htmlFor="tags">Tags</Label>
        <div className="mb-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1 bg-muted text-muted-foreground">
              {tag}
              <button 
                type="button" 
                onClick={() => handleRemoveTag(tag)}
                className="rounded-full w-4 h-4 flex items-center justify-center hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <Input
          id="tags"
          value={tagInput}
          onChange={handleTagInputChange}
          placeholder="Add tags (press Enter to add)"
          onKeyDown={handleAddTag}
          className="text-foreground bg-background"
        />
      </div>
      
      <div className="space-y-2 border rounded-md p-4 bg-background/50">
        <Label htmlFor="status" className="text-base font-medium">Status</Label>
        
        <div className="mt-2">
          {!canPublish && status === "draft" && (
            <Alert className="mb-4 text-amber-800 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need admin permissions to publish posts
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={toggleStatus}
              disabled={!canPublish && status === "draft"}
              className={`flex justify-between items-center gap-2 w-full sm:w-auto px-4 py-2 ${
                status === "published"
                  ? "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-900/20"
              }`}
            >
              {status === "published" ? (
                <ToggleRight className="h-5 w-5 text-green-500" />
              ) : (
                <ToggleLeft className="h-5 w-5 text-gray-400" />
              )}
              <span className="flex-1 text-left">{status === "published" ? "Published" : "Draft"}</span>
              <span className="text-xs text-muted-foreground">
                {status === "published" ? "Visible to all" : "Staff only"}
              </span>
            </Button>
          </div>
          
          <p className="mt-3 text-xs text-muted-foreground">
            {status === "published" 
              ? "Your post is currently live and visible to everyone" 
              : "Your post is saved as a draft and only visible to staff"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsFormBasicFields;
