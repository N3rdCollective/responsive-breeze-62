
import { useNavigate } from "react-router-dom";
import { toast } from '@/hooks/use-toast';
import { CreateTopicInput, ForumCategory, ForumTopic, ForumPost } from "@/types/forum";

interface UseNewTopicSubmitHandlerProps {
  title: string;
  content: string;
  category: ForumCategory | null;
  enablePoll: boolean;
  pollQuestion: string;
  pollOptions: string[];
  createTopic: (input: CreateTopicInput) => Promise<{ topic: ForumTopic; firstPost: ForumPost } | null>;
  isContentEffectivelyEmpty: () => boolean;
}

export const useNewTopicSubmitHandler = ({
  title,
  content,
  category,
  enablePoll,
  pollQuestion,
  pollOptions,
  createTopic,
  isContentEffectivelyEmpty,
}: UseNewTopicSubmitHandlerProps) => {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit called from hook");
    
    if (!title.trim()) {
      toast({ title: "Title required", description: "Please enter a title for your topic.", variant: "destructive" });
      return;
    }
    
    if (isContentEffectivelyEmpty()) {
      toast({ title: "Content required", description: "Please enter content for your topic.", variant: "destructive" });
      return;
    }
    
    if (!category) {
      console.error("Category not loaded, cannot submit topic.");
      toast({ title: "Error", description: "Category data is missing.", variant: "destructive" });
      return;
    }

    let pollInput: CreateTopicInput['poll'] = null;
    if (enablePoll) {
      if (!pollQuestion.trim()) {
        toast({ title: "Poll Question Required", description: "Please enter a question for your poll.", variant: "destructive" });
        return;
      }
      const validOptions = pollOptions.map(opt => opt.trim()).filter(opt => opt !== "");
      if (validOptions.length < 2) {
        toast({ title: "Poll Options Required", description: "Please provide at least two valid options for your poll.", variant: "destructive" });
        return;
      }
      pollInput = {
        question: pollQuestion.trim(),
        options: validOptions,
      };
    }
    
    console.log("Calling createTopic with:", { category_id: category.id, title, content, poll: pollInput });
    const result = await createTopic({
      category_id: category.id,
      title: title.trim(),
      content, // Content is already processed by editor, ensure trim applied to text if needed
      poll: pollInput,
    });
    
    console.log("createTopic result:", result);
    
    if (result && result.topic) {
      const navigateToPath = `/members/forum/${category.slug}/${result.topic.slug}`;
      console.log("Navigating to path:", navigateToPath);
      try {
        navigate(navigateToPath);
        console.log("Navigation call successful.");
      } catch (navError) {
        console.error("Error during navigation:", navError);
        toast({ title: "Navigation Error", description: "Could not navigate to the topic page.", variant: "destructive" });
      }
    } else {
      console.log("Topic creation failed or result is invalid, not navigating.");
      // Toast for failure is handled within useForumTopicCreator, but we can add a generic one if `result` is null
       if (!result) {
         toast({
            title: "Topic Creation Failed",
            description: "The topic could not be created. Please try again.",
            variant: "destructive"
         });
       } else if (result && !result.topic) { // Result exists but topic is missing
          toast({
             title: "Topic Data Missing",
             description: "Topic was created but data is incomplete. Cannot navigate.",
             variant: "destructive"
         });
       }
    }
  };

  return { handleSubmit };
};
