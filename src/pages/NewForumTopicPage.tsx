
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { useForumTopicCreator } from "@/hooks/forum/actions/useForumTopicCreator";
import NewTopicPageLoader from "@/components/forum/new-topic/NewTopicPageLoader";
import CategoryNotFoundDisplay from "@/components/forum/new-topic/CategoryNotFoundDisplay";
import NewTopicPageHeader from "@/components/forum/new-topic/NewTopicPageHeader";
import NewTopicForm from "@/components/forum/new-topic/NewTopicForm";
import { useForumCategoryLoader } from "@/hooks/forum/new-topic/useForumCategoryLoader";
import { useNewForumTopicForm } from "@/hooks/forum/new-topic/useNewForumTopicForm";
import { useNewTopicSubmitHandler } from "@/hooks/forum/new-topic/useNewTopicSubmitHandler";

const NewForumTopicPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { createTopic, submitting } = useForumTopicCreator();
  
  console.log('📄 [NEW_TOPIC_PAGE] Rendering with state:', {
    categorySlug,
    user: user?.id,
    authLoading,
    submitting
  });
  
  const { category, loadingCategory } = useForumCategoryLoader(categorySlug);
  
  const {
    title, setTitle,
    content, setContent,
    enablePoll, setEnablePoll,
    pollQuestion, setPollQuestion,
    pollOptions, 
    isContentEffectivelyEmpty,
    handlePollOptionChange,
    addPollOption,
    removePollOption,
  } = useNewForumTopicForm();

  const { handleSubmit } = useNewTopicSubmitHandler({
    title,
    content,
    category,
    enablePoll,
    pollQuestion,
    pollOptions,
    createTopic,
    isContentEffectivelyEmpty,
  });
  
  useEffect(() => {
    console.log('🔐 [NEW_TOPIC_PAGE] Auth check:', { user: user?.id, authLoading });
    if (!authLoading && !user) {
      console.log('🔐 [NEW_TOPIC_PAGE] Redirecting to auth - user not logged in');
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  
  useEffect(() => {
    console.log('📂 [NEW_TOPIC_PAGE] Category state:', { category: category?.name, loadingCategory });
  }, [category, loadingCategory]);
  
  if (authLoading || loadingCategory) {
    console.log('⏳ [NEW_TOPIC_PAGE] Still loading...');
    return <NewTopicPageLoader />;
  }
  
  if (!user) {
    console.log('🚫 [NEW_TOPIC_PAGE] No user found');
    return null; 
  }
  
  if (!category) {
    console.log('🚫 [NEW_TOPIC_PAGE] No category found');
    return <CategoryNotFoundDisplay />;
  }
  
  console.log('✅ [NEW_TOPIC_PAGE] Rendering main content');
  
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
            enablePoll={enablePoll}
            setEnablePoll={setEnablePoll}
            pollQuestion={pollQuestion}
            setPollQuestion={setPollQuestion}
            pollOptions={pollOptions}
            handlePollOptionChange={handlePollOptionChange}
            addPollOption={addPollOption}
            removePollOption={removePollOption}
          />
        </div>
      </div>
    </div>
  );
};

export default NewForumTopicPage;
