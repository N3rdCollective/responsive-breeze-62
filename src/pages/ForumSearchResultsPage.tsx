import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, SearchX, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ForumTopic } from '@/types/forum';
import ForumSearchResultItem from '@/components/forum/ForumSearchResultItem';
import { format } from 'date-fns';

interface FetchResultsParams {
  query: string | null;
  byUser: string | null;
  categoryId: string | null;
  startDate: string | null;
  endDate: string | null;
}

const fetchForumSearchResults = async ({ query, byUser, categoryId, startDate, endDate }: FetchResultsParams): Promise<ForumTopic[]> => {
  if (!query && !byUser && !categoryId && !startDate && !endDate) {
    return []; // No search criteria, return empty
  }

  let queryBuilder = supabase
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
      profile:profiles (username, display_name, profile_picture), 
      forum_posts(count)
    `);
    // Changed profiles!inner to profiles (default left join) to be more resilient to missing profile data.
    // Added profile_picture to the selection as it's part of ForumTopic type and used in display.

  if (query && query.trim() !== '') {
    queryBuilder = queryBuilder.ilike('title', `%${query.trim()}%`);
  }

  if (byUser && byUser.trim() !== '') {
    const byUserTrimmed = byUser.trim();
    queryBuilder = queryBuilder.or(
      `username.ilike.%${byUserTrimmed}%,display_name.ilike.%${byUserTrimmed}%`,
      { foreignTable: 'profiles' }
    );
  }

  if (categoryId && categoryId.trim() !== '') {
    queryBuilder = queryBuilder.eq('category_id', categoryId.trim());
  }

  if (startDate && startDate.trim() !== '') {
    queryBuilder = queryBuilder.gte('created_at', startDate.trim());
  }

  if (endDate && endDate.trim() !== '') {
    const endDateObj = new Date(endDate.trim());
    endDateObj.setDate(endDateObj.getDate() + 1); 
    queryBuilder = queryBuilder.lt('created_at', endDateObj.toISOString().split('T')[0]);
  }
  
  queryBuilder = queryBuilder.order('last_post_at', { ascending: false });

  // console.log("Forum Search Query Filters:", { query, byUser, categoryId, startDate, endDate });
  // console.log("Supabase Query Object (before execution):", queryBuilder);


  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error fetching forum search results. Supabase error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      fullError: error, // Log the full error object
    });
    throw new Error('Failed to fetch search results');
  }

  const rawResults = data || [];
  const transformedResults: ForumTopic[] = rawResults.map((rawTopic: any) => {
    const { forum_posts, ...rest } = rawTopic; 
    
    let postCount = 0;
    if (Array.isArray(forum_posts) && forum_posts.length > 0 && typeof forum_posts[0].count === 'number') {
        postCount = forum_posts[0].count;
    } else if (rawTopic.forum_posts_count !== undefined) { 
        postCount = rawTopic.forum_posts_count;
    }

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
      profile: rest.profile, // This will be null if profile doesn't exist (due to left join)
      _count: { posts: postCount },
    };
    return topic;
  });
  return transformedResults;
};

const ForumSearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const byUser = searchParams.get('byUser');
  const categoryId = searchParams.get('category');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const hasActiveFilters = !!(query?.trim() || byUser?.trim() || categoryId?.trim() || startDate?.trim() || endDate?.trim());

  const { data: results, isLoading, isError, error: queryHookError } = useQuery({
    queryKey: ['forumSearch', query, byUser, categoryId, startDate, endDate],
    queryFn: () => fetchForumSearchResults({ query, byUser, categoryId, startDate, endDate }),
    enabled: hasActiveFilters, 
  });

  const renderFilterSummary = () => {
    const filters = [];
    if (query) filters.push(<span key="q">Term: <strong className="text-primary">{query}</strong></span>);
    if (byUser) filters.push(<span key="user">User: <strong className="text-primary">{byUser}</strong></span>);
    if (categoryId && results?.[0]?.category?.name) { // Attempt to show category name if available
        const catName = results.find(r => r.category_id === categoryId)?.category?.name;
        filters.push(<span key="cat">Category: <strong className="text-primary">{catName || categoryId}</strong></span>);
    } else if (categoryId) {
        // Fallback if category name isn't readily available from results (e.g. no results yet, or category data structure issue)
        // This part might need a separate fetch for category name if not included in results, or rely on categories fetched in search bar
        filters.push(<span key="cat">Category ID: <strong className="text-primary">{categoryId}</strong></span>);
    }
    if (startDate) filters.push(<span key="sd">From: <strong className="text-primary">{format(new Date(startDate), "PPP")}</strong></span>);
    if (endDate) filters.push(<span key="ed">To: <strong className="text-primary">{format(new Date(endDate), "PPP")}</strong></span>);

    if (filters.length === 0) return <p className="text-gray-700 dark:text-gray-300 mb-6">Please enter search criteria by starting a new search.</p>;
    
    return (
      <div className="text-gray-700 dark:text-gray-300 mb-6">
        Showing results for: {filters.map((f,i) => <React.Fragment key={i}>{f}{i < filters.length -1 && ", "}</React.Fragment>)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <Button variant="outline" asChild>
              <Link to="/members/forum">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Forum
              </Link>
            </Button>
            <Button variant="default" asChild>
              <Link to="/forum/initiate-search">
                <Search className="mr-2 h-4 w-4" />
                New Search
              </Link>
            </Button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Forum Search Results
          </h1>
          
          {renderFilterSummary()}

          <div className="mt-8">
            {isLoading && hasActiveFilters && (
              <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Searching for topics...</p>
              </div>
            )}

            {isError && hasActiveFilters && (
              <div className="flex flex-col items-center justify-center p-10 text-destructive">
                <SearchX className="h-8 w-8 mb-4" />
                {/* queryHookError contains the error from react-query, which should be the one thrown by fetchForumSearchResults */}
                <p>Could not fetch search results. Error: {queryHookError?.message}</p>
              </div>
            )}

            {!isLoading && !isError && hasActiveFilters && results && results.length > 0 && (
              <div className="space-y-4">
                {results.map((topic) => (
                  <ForumSearchResultItem key={topic.id} topic={topic} />
                ))}
              </div>
            )}

            {!isLoading && !isError && hasActiveFilters && results && results.length === 0 && (
              <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
                <SearchX className="h-8 w-8 mb-4" />
                <p>No topics found matching your search criteria.</p>
                <p className="text-sm mt-2">Try using different keywords or filters by starting a new search.</p>
              </div>
            )}
            
            {!hasActiveFilters && !isLoading && ( // Show this if no filters are active
               <div className="p-6 bg-card rounded-lg shadow">
                <p className="text-muted-foreground text-center">
                  Please initiate a new search using the button above or by going to the search page.
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
