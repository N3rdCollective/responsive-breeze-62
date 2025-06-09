
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessagesSquare, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  display_order: number;
  _count?: {
    topics: number;
    posts: number;
  }
}

const ForumCategories = () => {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, { topics: number, posts: number }>>({});
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [searchParams] = useSearchParams();

  // Check for various refresh indicators
  const refreshParam = searchParams.get('refresh');
  const clearParam = searchParams.get('clear');
  const updatedParam = searchParams.get('updated');
  const shouldForceRefresh = refreshParam || clearParam || updatedParam;

  useEffect(() => {
    console.log('[ForumCategories] useEffect triggered. Refresh indicators:', { refreshParam, clearParam, updatedParam, retryAttempt });
    
    const fetchCategories = async () => {
      console.log('[ForumCategories] Starting fetchCategories.');
      setLoading(true);
      setHasError(false);
      
      try {
        // Add longer delay if this is triggered by a deletion refresh parameter
        if (shouldForceRefresh && retryAttempt === 0) {
          console.log('[ForumCategories] Force refresh detected, adding extended delay for database consistency');
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        // Add progressive delays for retry attempts
        if (retryAttempt > 0) {
          const delay = Math.min(1000 * retryAttempt, 3000); // Cap at 3 seconds
          console.log(`[ForumCategories] Retry attempt ${retryAttempt}, waiting ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // Fetch categories with cache busting
        console.log('[ForumCategories] Fetching categories from Supabase.');
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('forum_categories')
          .select('*')
          .order('display_order', { ascending: true });
          
        if (categoriesError) {
          console.error('[ForumCategories] Error fetching categories:', categoriesError.message);
          throw categoriesError;
        }
        
        console.log('[ForumCategories] Categories data received:', categoriesData);

        if (!categoriesData || categoriesData.length === 0) {
          console.log('[ForumCategories] No categories data found. Setting empty categories and stopping loading.');
          setCategories([]);
          setStats({});
          setLoading(false);
          return;
        }
        
        // Fetch topic counts for each category with improved error handling
        console.log('[ForumCategories] Fetching stats for categories.');
        const statPromises = categoriesData.map(async (category) => {
          try {
            // Get topics count
            const { count: topicsCount, error: topicsError } = await supabase
              .from('forum_topics')
              .select('*', { count: 'exact', head: true })
              .eq('category_id', category.id);
              
            if (topicsError) {
              console.error(`[ForumCategories] Error fetching topics count for category ${category.id}:`, topicsError.message);
              return {
                id: category.id,
                stats: { topics: 0, posts: 0 }
              };
            }
            
            // Get posts count for topics in this category
            const { data: topicIds } = await supabase
              .from('forum_topics')
              .select('id')
              .eq('category_id', category.id);
            
            let postsCount = 0;
            if (topicIds && topicIds.length > 0) {
              const topicIdArray = topicIds.map(t => t.id);
              const { count: pCount, error: postsError } = await supabase
                .from('forum_posts')
                .select('*', { count: 'exact', head: true })
                .in('topic_id', topicIdArray);
                
              if (postsError) {
                console.error(`[ForumCategories] Error fetching posts count for category ${category.id}:`, postsError.message);
              } else {
                postsCount = pCount || 0;
              }
            }
            
            return {
              id: category.id,
              stats: {
                topics: topicsCount || 0,
                posts: postsCount || 0
              }
            };
          } catch (err) {
            console.error(`[ForumCategories] Error processing stats for category ${category.id}:`, err);
            return {
              id: category.id,
              stats: { topics: 0, posts: 0 }
            };
          }
        });
        
        const statsResults = await Promise.all(statPromises);
        console.log('[ForumCategories] Stats results:', statsResults);
        
        const statsMap: Record<string, { topics: number, posts: number }> = {};
        statsResults.forEach(result => {
          statsMap[result.id] = result.stats;
        });
        
        console.log('[ForumCategories] Setting categories and stats. Categories:', categoriesData, 'StatsMap:', statsMap);
        setStats(statsMap);
        setCategories(categoriesData);
        setRetryAttempt(0); // Reset retry counter on success
        setHasError(false);
        
      } catch (error: any) {
        console.error('[ForumCategories] Overall error in fetchCategories:', error.message);
        setHasError(true);
        
        // Implement progressive retry logic
        if (retryAttempt < 3) {
          console.log(`[ForumCategories] Attempt ${retryAttempt + 1} failed, will retry`);
          setRetryAttempt(prev => prev + 1);
          return; // Don't show error toast yet, will retry
        }
        
        // Show error after max retries
        toast({
          title: "Error loading forum categories",
          description: "We couldn't load the forum categories after multiple attempts. Please try refreshing the page.",
          variant: "destructive"
        });
        setCategories([]);
        setStats({});
      } finally {
        console.log('[ForumCategories] Fetch finished. Setting loading to false.');
        setLoading(false);
      }
    };

    fetchCategories();
  }, [shouldForceRefresh, retryAttempt]);

  const handleManualRefresh = () => {
    console.log('[ForumCategories] Manual refresh triggered');
    setRetryAttempt(0);
    setHasError(false);
    // Force a reload by incrementing a counter
    window.location.href = window.location.pathname + `?manual_refresh=${Date.now()}`;
  };

  console.log('[ForumCategories] Rendering. Loading state:', loading, 'Categories count:', categories.length, 'Has error:', hasError);

  if (loading) {
    console.log('[ForumCategories] Rendering Loader.');
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading forum categories...</p>
        {retryAttempt > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Retry attempt {retryAttempt + 1}/4
          </p>
        )}
      </div>
    );
  }

  if (categories.length === 0) {
    console.log('[ForumCategories] Rendering No categories found message.');
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="flex flex-col items-center">
            {hasError ? <AlertCircle className="h-12 w-12 text-destructive mb-4" /> : <MessagesSquare className="h-12 w-12 text-muted-foreground mb-4" />}
            <p className="text-lg font-medium mb-2">
              {hasError ? "Error Loading Categories" : "No categories found"}
            </p>
            <p className="text-muted-foreground mb-4">
              {hasError 
                ? "There was a problem loading the forum categories. This might be temporary."
                : "There are no forum categories available right now."
              }
            </p>
            <div className="flex gap-2">
              <Button onClick={handleManualRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
              {hasError && (
                <Button onClick={() => setRetryAttempt(1)} variant="default">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Loading
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('[ForumCategories] Rendering categories list.');
  return (
    <div className="space-y-6">
      {/* Show refresh indicator if data was recently updated */}
      {shouldForceRefresh && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-200">
            <RefreshCw className="h-4 w-4" />
            <span>Forum data has been refreshed</span>
          </div>
        </div>
      )}
      
      {categories.map(category => (
        <Card key={category.id} className="overflow-hidden border-primary/20">
          <CardHeader className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80">
            <CardTitle>
              <Link to={`/members/forum/${category.slug}`} className="hover:text-primary transition-colors text-xl">
                {category.name}
              </Link>
            </CardTitle>
            <CardDescription>{category.description}</CardDescription>
          </CardHeader>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <MessagesSquare className="h-8 w-8 text-primary opacity-80" />
              <div>
                <p className="font-medium">{stats[category.id]?.topics || 0} Topics</p>
                <p className="text-sm text-muted-foreground">{stats[category.id]?.posts || 0} Posts</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50/50 dark:bg-gray-800/30 flex justify-between">
            <Button variant="ghost" asChild className="hover:text-primary">
              <Link to={`/members/forum/${category.slug}`}>View Topics</Link>
            </Button>
            <Button variant="outline" asChild className="bg-primary/10 hover:bg-primary/20 border-primary/20">
              <Link to={`/members/forum/${category.slug}/new`}>New Topic</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ForumCategories;
