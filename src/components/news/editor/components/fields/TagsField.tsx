
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TagsFieldProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

const TagsField: React.FC<TagsFieldProps> = ({ tags, setTags }) => {
  const [tagInput, setTagInput] = React.useState("");
  
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
  
  return (
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
  );
};

export default TagsField;
