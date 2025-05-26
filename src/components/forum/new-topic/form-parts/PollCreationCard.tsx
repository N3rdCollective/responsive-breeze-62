
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PlusCircle, XCircle } from "lucide-react";

interface PollCreationCardProps {
  enablePoll: boolean;
  setEnablePoll: (enabled: boolean) => void;
  pollQuestion: string;
  setPollQuestion: (question: string) => void;
  pollOptions: string[];
  handlePollOptionChange: (index: number, value: string) => void;
  addPollOption: () => void;
  removePollOption: (index: number) => void;
  submitting: boolean;
}

const PollCreationCard: React.FC<PollCreationCardProps> = ({
  enablePoll,
  setEnablePoll,
  pollQuestion,
  setPollQuestion,
  pollOptions,
  handlePollOptionChange,
  addPollOption,
  removePollOption,
  submitting,
}) => {
  return (
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
  );
};

export default PollCreationCard;
