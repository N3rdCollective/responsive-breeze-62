
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Added Switch
import { Loader2, PlusCircle, XCircle } from "lucide-react"; // Added icons
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
  // Poll props
  enablePoll: boolean;
  setEnablePoll: (enabled: boolean) => void;
  pollQuestion: string;
  setPollQuestion: (question: string) => void;
  pollOptions: string[];
  setPollOptions: (options: string[]) => void;
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
  // categoryName, // categoryName is not used here
  enablePoll,
  setEnablePoll,
  pollQuestion,
  setPollQuestion,
  pollOptions,
  setPollOptions,
}) => {
  const navigate = useNavigate();

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    if (pollOptions.length < 10) { // Max 10 options
      setPollOptions([...pollOptions, ""]);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) { // Min 2 options
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

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

            {/* Poll Creation Section */}
            <Card className="border-dashed border-primary/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Create a Poll (Optional)</CardTitle>
                    <CardDescription className="text-sm">Add a poll to gather opinions with your topic.</CardDescription>
                  </div>
                  <Switch
                    id="enable-poll"
                    checked={enablePoll}
                    onCheckedChange={setEnablePoll}
                    disabled={submitting}
                  />
                </div>
              </CardHeader>
              {enablePoll && (
                <CardContent className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="poll-question">Poll Question</Label>
                    <Input
                      id="poll-question"
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      placeholder="e.g., What's your favorite color?"
                      className="mt-1"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <Label>Poll Options</Label>
                    <div className="space-y-2 mt-1">
                      {pollOptions.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={option}
                            onChange={(e) => handlePollOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            disabled={submitting}
                          />
                          {pollOptions.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removePollOption(index)}
                              disabled={submitting}
                              aria-label="Remove option"
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      {pollOptions.length < 10 && (
                         <Button
                           type="button"
                           variant="outline"
                           size="sm"
                           onClick={addPollOption}
                           disabled={submitting || pollOptions.length >= 10}
                           className="mt-2 text-primary border-primary/30 hover:bg-primary/10"
                         >
                           <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                         </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Min 2 options, Max 10 options.</p>
                  </div>
                </CardContent>
              )}
            </Card>

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
