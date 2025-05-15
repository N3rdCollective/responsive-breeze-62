
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Image, Send } from 'lucide-react';
import { CreatePostInput } from '@/types/timeline';

interface CreatePostFormProps {
  onSubmit: (post: CreatePostInput) => Promise<any>;
  submitting: boolean;
  placeholder?: string;
}

const CreatePostForm = ({ 
  onSubmit, 
  submitting,
  placeholder = "What's on your mind?" 
}: CreatePostFormProps) => {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    await onSubmit({
      content: content.trim(),
      media_url: mediaUrl
    });
    
    // Reset form after successful submission
    setContent('');
    setMediaUrl(null);
  };
  
  // Media upload to be implemented in future version
  const handleAddMedia = () => {
    // This is a placeholder for future media upload functionality
    alert('Media upload will be available in a future update!');
  };

  return (
    <Card className="mb-6 shadow-sm">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <Textarea
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-24 resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            disabled={submitting}
          />
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={handleAddMedia}
            disabled={submitting}
          >
            <Image className="h-4 w-4 mr-2" />
            Add Media
          </Button>
          <Button 
            type="submit" 
            disabled={!content.trim() || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Post
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreatePostForm;
