
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ForumRichTextEditor from '@/components/forum/ForumRichTextEditor'; // Assuming this can be used for input
import { Loader2 } from 'lucide-react';

interface EditPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postContent: string;
  onSave: (newContent: string) => Promise<void>;
  isSaving: boolean;
  topicIsLocked?: boolean;
}

const EditPostDialog: React.FC<EditPostDialogProps> = ({
  open,
  onOpenChange,
  postContent,
  onSave,
  isSaving,
  topicIsLocked,
}) => {
  const [editedContent, setEditedContent] = useState(postContent);

  useEffect(() => {
    if (open) {
      setEditedContent(postContent);
    }
  }, [open, postContent]);

  const handleSave = async () => {
    if (topicIsLocked) {
        // This should ideally be prevented before opening the dialog or disabled in button
        console.warn("Attempted to save post in a locked topic.");
        return;
    }
    await onSave(editedContent);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Make changes to your post. Remember to adhere to community guidelines.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ForumRichTextEditor
            content={editedContent}
            onChange={setEditedContent}
            isEditable={!isSaving && !topicIsLocked} 
            placeholder="Edit your post content here..."
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving || !editedContent.trim() || topicIsLocked}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostDialog;
