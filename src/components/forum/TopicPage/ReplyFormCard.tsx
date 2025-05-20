
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, LockIcon } from "lucide-react";

interface ReplyFormCardProps {
  replyContent: string;
  onReplyContentChange: (value: string) => void;
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
  if (isLocked) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <LockIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">This topic is locked and cannot be replied to.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="py-3 px-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80">
        <CardTitle className="text-lg">Post a Reply</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={onSubmitReply}>
          <Textarea
            className="min-h-[120px] mb-4 border-primary/20 focus-visible:ring-primary"
            placeholder="Write your reply here..."
            value={replyContent}
            onChange={(e) => onReplyContentChange(e.target.value)}
            disabled={isSubmitting}
          />
          <Button 
            type="submit" 
            disabled={isSubmitting || !replyContent.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              'Post Reply'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReplyFormCard;
