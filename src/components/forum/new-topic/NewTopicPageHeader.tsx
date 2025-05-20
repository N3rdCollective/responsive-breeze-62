
import { Link } from "react-router-dom";
import { ForumCategory } from "@/types/forum";

interface NewTopicPageHeaderProps {
  category: ForumCategory;
}

const NewTopicPageHeader: React.FC<NewTopicPageHeaderProps> = ({ category }) => {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2">
          Create New Topic
        </h1>
        <div className="text-sm text-muted-foreground">
          Posting in <Link to={`/members/forum/${category.slug}`} className="text-primary hover:underline">{category.name}</Link>
        </div>
      </div>
      <div className="mb-6">
        <Link to={`/members/forum/${category.slug}`} className="text-sm text-primary hover:underline">
          &larr; Back to {category.name}
        </Link>
      </div>
    </>
  );
};

export default NewTopicPageHeader;
