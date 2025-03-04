
import { Post } from "../types/newsTypes";
import NewsCard from "./NewsCard";
import EmptyNewsState from "./EmptyNewsState";

interface NewsGridProps {
  posts: Post[] | undefined;
  selectedCategory: string | null;
}

export const NewsGrid = ({ posts, selectedCategory }: NewsGridProps) => {
  if (!posts || posts.length === 0) {
    return <EmptyNewsState selectedCategory={selectedCategory} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <NewsCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default NewsGrid;
