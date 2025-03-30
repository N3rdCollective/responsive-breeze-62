import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NewsStatus } from "../NewsForm";
import { Badge } from "@/components/ui/badge";
import { X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

// Predefined categories for the dropdown
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
  
  // Log status changes
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
      e.preventDefault(); // Prevent form submission
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
  
  // Direct status toggle that immediately calls setStatus
  const toggleStatus = () => {
    const newStatus: NewsStatus = status === "published" ? "draft" : "published";
    console.log(`[NewsFormBasicFields] Explicitly setting status from ${status} to ${newStatus}`);
    setStatus(newStatus);
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
      
      <div>
        <Label htmlFor="status">Status</Label>
        
        <div className="mt-2">
          {!canPublish && status === "draft" && (
            <Alert className="mb-2 text-amber-800 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You need admin permissions to publish posts
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Toggle 
                pressed={status === "published"}
                onPressedChange={() => {
                  console.log("[NewsFormBasicFields] Toggle pressed, current status:", status);
                  if (canPublish || status === "published") {
                    toggleStatus();
                  }
                }}
                disabled={!canPublish && status === "draft"}
                className={`${
                  status === "published" 
                    ? "bg-green-500 hover:bg-green-600" 
                    : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600"
                } text-white`}
                aria-label="Toggle publish status"
              >
                {status === "published" ? "Published" : "Draft"}
              </Toggle>
              
              <span className="text-sm text-muted-foreground">
                {status === "published" 
                  ? "Visible to everyone" 
                  : "Only visible to staff"}
              </span>
            </div>
            
            <div className="flex-1">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={toggleStatus}
                disabled={!canPublish && status === "draft"}
                className="text-sm"
              >
                {status === "published" ? "Switch to Draft" : "Publish Now"}
              </Button>
            </div>
          </div>
          
          <p className="mt-2 text-xs text-muted-foreground">
            {status === "published" 
              ? "Click to unpublish and save as draft" 
              : "Click to publish and make visible to everyone"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsFormBasicFields;
