
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
    
    if (!title.trim()) {
      toast({ title: "Title required", description: "Please enter a title for your topic.", variant: "destructive" });
      return;
    }
    
    if (isContentEffectivelyEmpty()) {
      toast({ title: "Content required", description: "Please enter content for your topic.", variant: "destructive" });
      return;
    }
    
    if (!category) {
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
    
    const result = await createTopic({
      category_id: category.id,
      title: title.trim(),
      content,
      poll: pollInput,
    });
    
    if (result && result.topic) {
      const navigateToPath = `/members/forum/${category.slug}/${result.topic.slug}`;
      try {
        navigate(navigateToPath);
      } catch (navError) {
        console.error("Error during navigation:", navError);
        toast({ title: "Navigation Error", description: "Could not navigate to the topic page.", variant: "destructive" });
      }
    } else {
      if (!result) {
         toast({
            title: "Topic Creation Failed",
            description: "The topic could not be created. Please try again.",
            variant: "destructive"
         });
       } else if (result && !result.topic) {
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
