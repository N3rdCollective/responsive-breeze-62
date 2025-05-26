import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useForumTopicCreator } from "@/hooks/forum/actions/useForumTopicCreator";
import { ForumCategory, CreatePollInput } from "@/types/forum";
import NewTopicPageLoader from "@/components/forum/new-topic/NewTopicPageLoader";
import CategoryNotFoundDisplay from "@/components/forum/new-topic/CategoryNotFoundDisplay";
import NewTopicPageHeader from "@/components/forum/new-topic/NewTopicPageHeader";
import NewTopicForm from "@/components/forum/new-topic/NewTopicForm";

const NewForumTopicPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { createTopic, submitting } = useForumTopicCreator();
  
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  
  // Poll state
  const [enablePoll, setEnablePoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]); // Start with 2 empty options
  
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categorySlug) return;
      
      try {
        setLoadingCategory(true);
        
        const { data, error } = await supabase
          .from('forum_categories')
          .select('*')
          .eq('slug', categorySlug)
          .single();
          
        if (error) throw error;
        
        if (!data) {
          navigate('/members/forum');
          toast({
            title: "Category not found",
            description: "The forum category you're looking for doesn't exist.",
            variant: "destructive"
          });
          return;
        }
        
        setCategory(data);
      } catch (error: any) {
        console.error('Error fetching category:', error.message);
        toast({
          title: "Error loading category",
          description: "We couldn't load the category data. Please try again.",
          variant: "destructive"
        });
        navigate('/members/forum');
      } finally {
        setLoadingCategory(false);
      }
    };
    
    fetchCategory();
  }, [categorySlug, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your topic.",
        variant: "destructive"
      });
      return;
    }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    if (!content.trim() || !tempDiv.textContent?.trim()) {
      toast({
        title: "Content required",
        description: "Please enter content for your topic.",
        variant: "destructive"
      });
      return;
    }
    
    if (!category) return;

    let pollInput: CreatePollInput | null = null;
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
      title,
      content,
      poll: pollInput, // Pass poll data
    });
    
    if (result && result.topic) {
      navigate(`/members/forum/${categorySlug}/${result.topic.slug || result.topic.id}`);
    }
  };
  
  const isContentEffectivelyEmpty = () => {
    if (!content.trim()) return true;
    const div = document.createElement('div');
    div.innerHTML = content;
    return !div.textContent?.trim();
  };
  
  if (authLoading || loadingCategory) {
    return <NewTopicPageLoader />;
  }
  
  if (!user) {
    // This case should ideally be handled by the auth redirect,
    // but it's good for robustness.
    return null; 
  }
  
  if (!category) {
    return <CategoryNotFoundDisplay />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <NewTopicPageHeader category={category} />
          <NewTopicForm
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            handleSubmit={handleSubmit}
            submitting={submitting}
            isContentEffectivelyEmpty={isContentEffectivelyEmpty}
            categorySlug={category.slug}
            categoryName={category.name}
            enablePoll={enablePoll}
            setEnablePoll={setEnablePoll}
            pollQuestion={pollQuestion}
            setPollQuestion={setPollQuestion}
            pollOptions={pollOptions}
            setPollOptions={setPollOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default NewForumTopicPage;
