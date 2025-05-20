
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Removed Textarea, importing RichTextEditor instead
import RichTextEditor from '@/components/news/editor/RichTextEditor';
import { Loader2, MessageSquareText, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ReplyFormCardProps {
  replyContent: string;
  onReplyContentChange: (content: string) => void;
  onSubmitReply: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  isLocked: boolean;
}

const ReplyFormCard: React.FC<ReplyFormCardProps> = ({
  replyContent,
  onReplyContentChange,
  onSubmitReply,
  isSubmitting,
  isLocked,
}) => {
  const { user } = useAuth();

  if (isLocked) {
    return (
      <Card className="mt-6 border-amber-500/30">
        <CardHeader className="bg-amber-50/50 dark:bg-amber-900/20">
          <CardTitle className="flex items-center text-amber-700 dark:text-amber-400">
            <Lock className="h-5 w-5 mr-2" />
            Topic Locked
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">This topic is locked. No new replies can be posted.</p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="mt-6 border-primary/20">
        <CardHeader className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80">
          <CardTitle className="flex items-center">
            <MessageSquareText className="h-5 w-5 mr-2" />
            Join the Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground mb-4">You need to be logged in to post a reply.</p>
          <Button asChild>
            <Link to="/auth">Login or Sign Up</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Check if content is empty or just empty HTML like <p></p>
  const isContentEffectivelyEmpty = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = replyContent;
    return !replyContent.trim() || !tempDiv.textContent?.trim();
  };


  return (
    <Card className="mt-6 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80">
        <CardTitle className="flex items-center">
          <MessageSquareText className="h-5 w-5 mr-2" />
          Post a Reply
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={onSubmitReply}>
          <div className="space-y-4">
            {/* Using RichTextEditor for reply content */}
            <RichTextEditor
              id="replyContent"
              value={replyContent}
              onChange={onReplyContentChange}
              label="Your Reply"
              height={250} // Adjusted height for reply context
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || isContentEffectivelyEmpty()} className="bg-primary hover:bg-primary/90">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Post Reply'
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReplyFormCard;
