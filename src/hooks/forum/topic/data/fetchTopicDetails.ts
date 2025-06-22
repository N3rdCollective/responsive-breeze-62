
import { SupabaseClient } from '@supabase/supabase-js';
import { NavigateFunction } from 'react-router-dom';
import { ForumTopic, ForumPoll, ForumPollOption, ForumPollVote } from '@/types/forum';
import { toast } from '@/hooks/use-toast';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchTopicDetails = async (
  paramTopicSlug: string,
  supabase: SupabaseClient,
  toastFn: typeof toast,
  navigate: NavigateFunction,
  currentUserId?: string | null,
  retryCount: number = 0
): Promise<{topic: ForumTopic | null, categorySlug: string | null}> => {
  if (!paramTopicSlug) {
    console.warn('[fetchTopicDetails] Called without paramTopicSlug.');
    return { topic: null, categorySlug: null};
  }

  const maxRetries = 5; // Increased retries for newly created topics
  const baseRetryDelay = 750; // Increased base delay
  const retryDelay = baseRetryDelay * (retryCount + 1); // Progressive delay

  try {
    console.log(`[fetchTopicDetails] Fetching topic by slug: ${paramTopicSlug} (attempt ${retryCount + 1}/${maxRetries + 1})`);
    
    const { data: topicData, error: topicError } = await supabase
      .from('forum_topics')
      .select(`
        *,
        category:forum_categories!inner (slug, name),
        profile:profiles!user_id ( 
          username,
          display_name,
          profile_picture,
          created_at,
          forum_post_count,
          forum_signature
        ),
        poll:forum_polls!left (
            *,
            options:forum_poll_options (
                *,
                votes:forum_poll_votes!left(user_id, option_id)
            )
        )
      `)
      .eq('slug', paramTopicSlug)
      .single();

    console.log(`[fetchTopicDetails] Supabase response for topic query (attempt ${retryCount + 1}):`, { topicSlug: paramTopicSlug, topicData, topicError });

    if (topicError) {
      console.error('[fetchTopicDetails] Topic fetch error from Supabase:', topicError);
      
      // If it's a "not found" error and we haven't exceeded retries, try again with progressive delay
      if ((topicError.code === 'PGRST116' || topicError.message.includes('JSON object requested, multiple') || topicError.message.includes('0 rows')) && retryCount < maxRetries) {
        console.log(`[fetchTopicDetails] Topic not found, retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries + 1})`);
        await delay(retryDelay);
        return fetchTopicDetails(paramTopicSlug, supabase, toastFn, navigate, currentUserId, retryCount + 1);
      }
      
      if (topicError.code === 'PGRST201' || topicError.message.includes("JSON object requested, single row returned") || topicError.message.includes("multiple rows returned") ) {
          // Handle cases where poll might cause issues with .single() if not properly structured or if RLS for poll options/votes fails for anon users.
          // For now, let's try fetching topic without poll if the error is specific to relationship.
          const { data: fallbackTopicData, error: fallbackError } = await supabase
            .from('forum_topics')
            .select(`
              *,
              category:forum_categories!inner (slug, name),
              profile:profiles!user_id (username, display_name, profile_picture, created_at, forum_post_count, forum_signature)
            `)
            .eq('slug', paramTopicSlug)
            .single();

          if (fallbackError) {
            console.error('[fetchTopicDetails] Fallback topic fetch error:', fallbackError);
            
            // Retry fallback if it's a not found error and we haven't exceeded retries
            if ((fallbackError.code === 'PGRST116' || fallbackError.message.includes('0 rows')) && retryCount < maxRetries) {
              console.log(`[fetchTopicDetails] Fallback topic not found, retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries + 1})`);
              await delay(retryDelay);
              return fetchTopicDetails(paramTopicSlug, supabase, toastFn, navigate, currentUserId, retryCount + 1);
            }
            
            toastFn({
                title: "Data Fetching Issue",
                description: "There's an issue specifying relationships in the data query. Details: " + (fallbackError.message || topicError.message),
                variant: "destructive",
            });
            throw new Error(fallbackError.message || topicError.message);
          }
          if (!fallbackTopicData) {
            if (retryCount < maxRetries) {
              console.log(`[fetchTopicDetails] No fallback data, retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries + 1})`);
              await delay(retryDelay);
              return fetchTopicDetails(paramTopicSlug, supabase, toastFn, navigate, currentUserId, retryCount + 1);
            }
            throw new Error('Topic not found after fallback');
          }
          
          const fetchedCategorySlug = (fallbackTopicData as any).category?.slug || null;
          console.warn('[fetchTopicDetails] Fetched topic with fallback (poll data might be missing or caused initial error).');
          return { topic: fallbackTopicData as ForumTopic, categorySlug: fetchedCategorySlug };
      }
      throw new Error(topicError.message);
    }

    if (!topicData) {
      console.warn('[fetchTopicDetails] Topic not found in DB for slug:', paramTopicSlug, '(topicData is null/undefined)');
      
      // Retry if we haven't exceeded max retries with progressive delay
      if (retryCount < maxRetries) {
        console.log(`[fetchTopicDetails] No topic data, retrying in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries + 1})`);
        await delay(retryDelay);
        return fetchTopicDetails(paramTopicSlug, supabase, toastFn, navigate, currentUserId, retryCount + 1);
      }
      
      throw new Error('Topic not found');
    }
    
    let processedTopicData = topicData as ForumTopic;
    
    // Process poll data if it exists
    if (processedTopicData.poll && processedTopicData.poll.options) {
        let totalVotes = 0;
        processedTopicData.poll.options = processedTopicData.poll.options.map(opt => {
            const votesForOption = (opt as any).votes as ForumPollVote[] || [];
            
            const userVoteOnThisOption = currentUserId ? votesForOption.find(v => v.user_id === currentUserId) : null;
            if (userVoteOnThisOption) {
                if (processedTopicData.poll) { // Check again for type safety
                    processedTopicData.poll.currentUserVote = userVoteOnThisOption.option_id;
                }
            }
            // Remove the raw 'votes' array from the option after processing
            const { votes, ...optionWithoutVotes } = opt as any;
            return optionWithoutVotes as ForumPollOption;
        });

        // Calculate total votes from the sum of vote_count on options
        totalVotes = processedTopicData.poll.options.reduce((sum, opt) => sum + (opt.vote_count || 0), 0);
        processedTopicData.poll.totalVotes = totalVotes;
    }

    const fetchedCategorySlug = (processedTopicData as any).category?.slug || null;
    console.log(`[fetchTopicDetails] Topic fetched successfully on attempt ${retryCount + 1}:`, (processedTopicData as any).title);
    return { topic: processedTopicData, categorySlug: fetchedCategorySlug };

  } catch (err: any) {
    console.error(`[fetchTopicDetails] Error in fetchTopicDetails (attempt ${retryCount + 1}):`, err);
    
    // Retry if it's a "not found" error and we haven't exceeded max retries
    if ((err.message === 'Topic not found' || (err.details && err.details.includes('0 rows'))) && retryCount < maxRetries) {
      console.log(`[fetchTopicDetails] Retrying due to not found error in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries + 1})`);
      await delay(retryDelay);
      return fetchTopicDetails(paramTopicSlug, supabase, toastFn, navigate, currentUserId, retryCount + 1);
    }
    
    if (err.message === 'Topic not found' || (err.details && err.details.includes('0 rows'))) {
      toastFn({ 
        title: "Topic Not Found",
        description: "The topic you're looking for doesn't exist or is still being processed. Please try refreshing the page or check back in a moment.",
        variant: "destructive",
        action: (
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Refresh Page
          </button>
        ),
      });
      navigate('/members/forum', { replace: true });
    } else if (err.code !== 'PGRST201' && !err.message.includes("JSON object requested, single row returned") && !err.message.includes("multiple rows returned")) { 
       toastFn({
        title: "Error loading topic",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    }
    throw err;
  }
};
