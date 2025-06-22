
import { Navigate, useParams } from 'react-router-dom';

const RedirectNewTopic = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  // If categorySlug is somehow undefined, redirect to the main forum page as a fallback.
  if (!categorySlug) {
    return <Navigate to="/members/forum" replace />;
  }

  // Redirect to the correct new topic page structure.
  return <Navigate to={`/members/forum/${categorySlug}/new-topic`} replace />;
};

export default RedirectNewTopic;
