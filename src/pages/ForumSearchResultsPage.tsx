import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, SearchX } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ForumTopic } from '@/types/forum';
import ForumSearchResultItem from '@/components/forum/ForumSearchResultItem';

const fetchForumSearchResults = async (query: string | null): Promise<ForumTopic[]> => {
  if (!query || query.trim() === '') {
    return [];
  }

  const { data, error } = await supabase
    .from('forum_topics')
    .select(`
      id,
      title,
      slug,
      created_at,
      updated_at,
      user_id,
      category_id,
      is_sticky,
      is_locked,
      view_count,
      last_post_at,
      last_post_user_id,
      category:forum_categories (name, slug),
      profile:profiles!user_id (username, display_name),
      forum_posts(count)
    `)
    .ilike('title', `%${query.trim()}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching forum search results:', error);
    throw new Error('Failed to fetch search results');
  }

  const rawResults = data || [];
  const transformedResults: ForumTopic[] = rawResults.map((rawTopic: any) => {
    // Supabase returns the count as 'foreign_table_name_count', so 'forum_posts_count'
    const { forum_posts_count, ...rest } = rawTopic;
    
    // Explicitly define the topic structure to ensure type safety
    const topic: ForumTopic = {
      id: rest.id,
      title: rest.title,
      slug: rest.slug,
      created_at: rest.created_at,
      updated_at: rest.updated_at,
      user_id: rest.user_id,
      category_id: rest.category_id,
      is_sticky: rest.is_sticky,
      is_locked: rest.is_locked,
      view_count: rest.view_count,
      last_post_at: rest.last_post_at,
      last_post_user_id: rest.last_post_user_id,
      category: rest.category,
      profile: rest.profile,
    };

    if (typeof forum_posts_count === 'number') {
      topic._count = { posts: forum_posts_count };
    }
    return topic;
  });
  return transformedResults;
};

const ForumSearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');

  const { data: results, isLoading, isError, error } = useQuery({
    queryKey: ['forumSearch', query],
    queryFn: () => fetchForumSearchResults(query),
    enabled: !!query && query.trim() !== '', // Only run query if 'q' exists and is not empty
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link to="/members/forum">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Forum
              </Link>
            </Button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Forum Search Results
          </h1>
          {query ? (
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Showing results for: <strong className="text-primary">{query}</strong>
            </p>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Please enter a search term to see results.
            </p>
          )}

          <div className="mt-8">
            {isLoading && (
              <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Searching for topics...</p>
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center p-10 text-destructive">
                <SearchX className="h-8 w-8 mb-4" />
                <p>Could not fetch search results. Error: {error?.message}</p>
              </div>
            )}

            {!isLoading && !isError && query && results && results.length > 0 && (
              <div className="space-y-4">
                {results.map((topic) => (
                  <ForumSearchResultItem key={topic.id} topic={topic} />
                ))}
              </div>
            )}

            {!isLoading && !isError && query && results && results.length === 0 && (
              <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
                <SearchX className="h-8 w-8 mb-4" />
                <p>No topics found matching your search term "{query}".</p>
                <p className="text-sm mt-2">Try using different keywords or check for typos.</p>
              </div>
            )}
            
            {!isLoading && !isError && !query && (
               <div className="p-6 bg-card rounded-lg shadow">
                <p className="text-muted-foreground text-center">
                  Enter a term in the search bar on the forum page to find topics.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumSearchResultsPage;
