
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
    
    console.log('🚀 [TOPIC_SUBMIT] Starting topic submission process', {
      title: title.trim(),
      contentLength: content.length,
      category: category?.name,
      enablePoll,
      pollQuestion: pollQuestion.trim(),
      pollOptionsCount: pollOptions.length
    });
    
    // Basic validation with detailed logging
    if (!title.trim()) {
      console.log('❌ [TOPIC_SUBMIT] Validation failed: Title is empty');
      toast({ title: "Title required", description: "Please enter a title for your topic.", variant: "destructive" });
      return;
    }
    
    // Simplified content validation - just check if there's any content at all
    if (!content || content.trim().length === 0) {
      console.log('❌ [TOPIC_SUBMIT] Validation failed: Content is empty');
      toast({ title: "Content required", description: "Please enter content for your topic.", variant: "destructive" });
      return;
    }
    
    // Check if content is effectively empty (only HTML tags, no actual text)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    if (textContent.trim().length === 0) {
      console.log('❌ [TOPIC_SUBMIT] Validation failed: Content is effectively empty', { content, textContent });
      toast({ title: "Content required", description: "Please enter meaningful content for your topic.", variant: "destructive" });
      return;
    }
    
    if (!category) {
      console.log('❌ [TOPIC_SUBMIT] Validation failed: Category is missing');
      toast({ title: "Error", description: "Category data is missing.", variant: "destructive" });
      return;
    }

    // Poll validation
    let pollInput: CreateTopicInput['poll'] = null;
    if (enablePoll) {
      console.log('🗳️ [TOPIC_SUBMIT] Poll validation', { pollQuestion: pollQuestion.trim(), pollOptions });
      
      if (!pollQuestion.trim()) {
        console.log('❌ [TOPIC_SUBMIT] Poll validation failed: Poll question is empty');
        toast({ title: "Poll Question Required", description: "Please enter a question for your poll.", variant: "destructive" });
        return;
      }
      
      const validOptions = pollOptions.map(opt => opt.trim()).filter(opt => opt !== "");
      if (validOptions.length < 2) {
        console.log('❌ [TOPIC_SUBMIT] Poll validation failed: Not enough poll options', { validOptions });
        toast({ title: "Poll Options Required", description: "Please provide at least two valid options for your poll.", variant: "destructive" });
        return;
      }
      
      pollInput = {
        question: pollQuestion.trim(),
        options: validOptions,
      };
      
      console.log('✅ [TOPIC_SUBMIT] Poll validation passed', pollInput);
    }
    
    console.log('✅ [TOPIC_SUBMIT] All validations passed, calling createTopic');
    
    try {
      const topicData = {
        category_id: category.id,
        title: title.trim(),
        content,
        poll: pollInput,
      };
      
      console.log('📝 [TOPIC_SUBMIT] Topic data to create:', topicData);
      
      const result = await createTopic(topicData);
      
      console.log('🎯 [TOPIC_SUBMIT] createTopic result:', result);
      
      if (result && result.topic) {
        const navigateToPath = `/members/forum/${category.slug}/${result.topic.slug}`;
        console.log('🧭 [TOPIC_SUBMIT] Navigating to:', navigateToPath);
        
        toast({ 
          title: "Topic Created!", 
          description: `Your new topic "${result.topic.title}" has been successfully created.`,
          variant: "default"
        });
        
        try {
          navigate(navigateToPath);
          console.log('✅ [TOPIC_SUBMIT] Navigation successful');
        } catch (navError) {
          console.error("❌ [TOPIC_SUBMIT] Navigation error:", navError);
          toast({ title: "Navigation Error", description: "Topic created but could not navigate to the topic page.", variant: "destructive" });
        }
      } else {
        console.error('❌ [TOPIC_SUBMIT] Topic creation failed:', result);
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
    } catch (error) {
      console.error('❌ [TOPIC_SUBMIT] Unexpected error during topic creation:', error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred while creating the topic. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { handleSubmit };
};
