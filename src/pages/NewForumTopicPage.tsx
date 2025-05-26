
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
  
  const { category, loadingCategory } = useForumCategoryLoader(categorySlug);
  
  const {
    title, setTitle,
    content, setContent,
    enablePoll, setEnablePoll,
    pollQuestion, setPollQuestion,
    pollOptions, 
    // setPollOptions, // Direct setter not passed if individual handlers are used
    isContentEffectivelyEmpty,
    handlePollOptionChange,
    addPollOption,
    removePollOption,
  } = useNewForumTopicForm(); // Using default initial poll options

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
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  
  if (authLoading || loadingCategory) {
    return <NewTopicPageLoader />;
  }
  
  if (!user) {
    // This case should ideally be handled by the auth redirect useEffect,
    // but it's good for robustness if navigation hasn't completed yet.
    return null; 
  }
  
  if (!category) {
    // useForumCategoryLoader should handle navigation if category not found or error.
    // This renders CategoryNotFoundDisplay if category is null AFTER loading is false.
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
            // categoryName={category.name} // Was unused in NewTopicForm
            enablePoll={enablePoll}
            setEnablePoll={setEnablePoll}
            pollQuestion={pollQuestion}
            setPollQuestion={setPollQuestion}
            pollOptions={pollOptions}
            setPollOptions={() => {}} // No-op as handlers are preferred; or remove if not in interface
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
