
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessagesSquare } from 'lucide-react';
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

  useEffect(() => {
    console.log('[ForumCategories] useEffect triggered. Initial loading state:', loading);
    const fetchCategories = async () => {
      console.log('[ForumCategories] Starting fetchCategories.');
      setLoading(true); // Explicitly set loading true at the start of fetch
      try {
        // Fetch categories
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
        
        // Fetch topic counts for each category
        console.log('[ForumCategories] Fetching stats for categories.');
        const statPromises = categoriesData.map(async (category) => {
          // Get topics count
          const { count: topicsCount, error: topicsError } = await supabase
            .from('forum_topics')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);
            
          if (topicsError) {
            console.error(`[ForumCategories] Error fetching topics count for category ${category.id}:`, topicsError.message);
            throw topicsError; // Re-throw to be caught by the main catch block
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
              throw postsError; // Re-throw
            }
            postsCount = pCount || 0;
          }
          
          return {
            id: category.id,
            stats: {
              topics: topicsCount || 0,
              posts: postsCount || 0
            }
          };
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
        
      } catch (error: any) {
        console.error('[ForumCategories] Overall error in fetchCategories:', error.message);
        toast({
          title: "Error loading forum categories",
          description: "We couldn't load the forum categories. Please try again.",
          variant: "destructive"
        });
        setCategories([]); // Ensure categories are empty on error
        setStats({});
      } finally {
        console.log('[ForumCategories] Fetch finished. Setting loading to false.');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array means this runs once on mount

  console.log('[ForumCategories] Rendering. Loading state:', loading, 'Categories count:', categories.length);

  if (loading) {
    console.log('[ForumCategories] Rendering Loader.');
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (categories.length === 0) {
    console.log('[ForumCategories] Rendering No categories found message.');
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-lg font-medium mb-2">No categories found</p>
          <p className="text-muted-foreground mb-4">
            There are no forum categories available right now.
          </p>
        </CardContent>
      </Card>
    );
  }

  console.log('[ForumCategories] Rendering categories list.');
  return (
    <div className="space-y-6">
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

