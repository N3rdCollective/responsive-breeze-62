
import React, { useEffect } from "react";
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
import { NewsStatus } from "../NewsForm";
import { Badge } from "@/components/ui/badge";
import { X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    console.log("[NewsFormBasicFields] Status prop updated:", status);
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
  
  const handleStatusChange = (value: NewsStatus) => {
    console.log("[NewsFormBasicFields] Status change requested:", value);
    // Call the parent component's setStatus function with the new value
    setStatus(value);
    // Log after the update to verify it happened
    setTimeout(() => console.log("[NewsFormBasicFields] Status after update call:", value), 0);
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
        <Select
          value={category}
          onValueChange={(value: string) => setCategory(value)}
        >
          <SelectTrigger id="category" className="text-foreground bg-background">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="z-50">
            {PREDEFINED_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        {!canPublish && status === "draft" && (
          <Alert className="mb-2 text-amber-800 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need admin permissions to publish posts
            </AlertDescription>
          </Alert>
        )}
        <Select
          value={status}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger id="status" className="text-foreground bg-background">
            <SelectValue placeholder="Select status">
              {status === "published" ? "Published" : "Draft"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent 
            className="z-[9999]"
            position="popper"
            sideOffset={4}
          >
            <SelectItem value="draft">Draft</SelectItem>
            {canPublish ? (
              <SelectItem value="published">Published</SelectItem>
            ) : (
              <SelectItem value="published" disabled>
                Published (Requires Admin Permission)
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default NewsFormBasicFields;
