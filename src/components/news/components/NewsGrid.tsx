
import { Post } from "../types/newsTypes";
import NewsCard from "./NewsCard";
import EmptyNewsState from "./EmptyNewsState";

interface NewsGridProps {
  posts: Post[] | undefined;
  selectedCategory: string | null;
}

export const NewsGrid = ({ posts, selectedCategory }: NewsGridProps) => {
  console.log('🗞️ NewsGrid received props:', {
    posts,
    postsCount: posts?.length,
    selectedCategory,
    postsType: typeof posts
  });

  if (!posts || posts.length === 0) {
    console.log('🗞️ NewsGrid: No posts to display, showing empty state');
    return <EmptyNewsState selectedCategory={selectedCategory} />;
  }

  console.log('🗞️ NewsGrid: Rendering', posts.length, 'posts');
  console.log('🗞️ NewsGrid: First post details:', posts[0]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post, index) => {
        console.log(`🗞️ NewsGrid: Rendering post ${index + 1}:`, {
          id: post.id,
          title: post.title,
          category: post.category,
          author_name: post.author_name,
          post_date: post.post_date
        });
        return (
          <NewsCard key={post.id} post={post} />
        );
      })}
    </div>
  );
};

export default NewsGrid;
