
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TopicDetailsInputs from "./form-parts/TopicDetailsInputs";
import PollCreationCard from "./form-parts/PollCreationCard";
import NewTopicFormActions from "./form-parts/NewTopicFormActions";

interface NewTopicFormProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  submitting: boolean;
  isContentEffectivelyEmpty: () => boolean;
  categorySlug: string | undefined;
  
  enablePoll: boolean;
  setEnablePoll: (enabled: boolean) => void;
  pollQuestion: string;
  setPollQuestion: (question: string) => void;
  pollOptions: string[];
  handlePollOptionChange: (index: number, value: string) => void;
  addPollOption: () => void;
  removePollOption: (index: number) => void;
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
  enablePoll,
  setEnablePoll,
  pollQuestion,
  setPollQuestion,
  pollOptions,
  handlePollOptionChange,
  addPollOption,
  removePollOption,
}) => {
  const navigate = useNavigate();

  const handleCancel = () => {
    if (categorySlug) {
      navigate(`/members/forum/${categorySlug}`);
    } else {
      navigate('/members/forum'); // Fallback if categorySlug is undefined
    }
  };

  const isSubmitButtonDisabled = !title.trim() || isContentEffectivelyEmpty();

  return (
    <Card className="border-primary/20">
      <CardHeader className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80">
        <CardTitle>New Topic Details</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <TopicDetailsInputs
              title={title}
              setTitle={setTitle}
              content={content}
              setContent={setContent}
              submitting={submitting}
            />

            <PollCreationCard
              enablePoll={enablePoll}
              setEnablePoll={setEnablePoll}
              pollQuestion={pollQuestion}
              setPollQuestion={setPollQuestion}
              pollOptions={pollOptions}
              handlePollOptionChange={handlePollOptionChange}
              addPollOption={addPollOption}
              removePollOption={removePollOption}
              submitting={submitting}
            />

            <NewTopicFormActions
              submitting={submitting}
              isSubmitDisabled={isSubmitButtonDisabled}
              onCancel={handleCancel}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewTopicForm;
