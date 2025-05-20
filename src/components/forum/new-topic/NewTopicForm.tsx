
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import ForumRichTextEditor from "@/components/forum/ForumRichTextEditor";

interface NewTopicFormProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  submitting: boolean;
  isContentEffectivelyEmpty: () => boolean;
  categorySlug: string | undefined;
  categoryName: string;
}

const NewTopicForm: React.FC<NewTopicFormProps> = ({
  title,
  setTitle,
  content,
  setContent,
  handleSubmit,
  submitting,
  isContentEffectivelyEmpty,
  categorySlug,
  categoryName,
}) => {
  const navigate = useNavigate();

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80">
        <CardTitle>New Topic Details</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Topic Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your topic"
                className="mt-1 border-primary/20 focus-visible:ring-primary"
                disabled={submitting}
              />
            </div>
            <div>
              <ForumRichTextEditor
                id="content"
                value={content}
                onChange={setContent}
                label="Content"
                height={300}
                placeholder="Write your post here..."
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/members/forum/${categorySlug}`)}
                disabled={submitting}
                className="border-primary/20"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !title.trim() || isContentEffectivelyEmpty()}
                className="bg-primary hover:bg-primary/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Topic...
                  </>
                ) : (
                  'Create Topic'
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewTopicForm;
