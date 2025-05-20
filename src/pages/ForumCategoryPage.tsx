import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, PlusCircle } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { ForumCategory, ForumTopic } from "@/types/forum";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";

const ForumCategoryPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);
  
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categorySlug) return;
      
      try {
        setLoading(true);
        
        // Fetch category
        const { data: categoryData, error: categoryError } = await supabase
          .from('forum_categories')
          .select('*')
          .eq('slug', categorySlug)
          .single();
          
        if (categoryError) throw categoryError;
        
        if (!categoryData) {
          navigate('/members');
          toast({
            title: "Category not found",
            description: "The forum category you're looking for doesn't exist.",
            variant: "destructive"
          });
          return;
        }
        
        setCategory(categoryData);
        
        // Count total topics for pagination
        const { count, error: countError } = await supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', categoryData.id);
          
        if (countError) throw countError;
        
        const totalPageCount = Math.ceil((count || 0) / ITEMS_PER_PAGE);
        setTotalPages(totalPageCount || 1);
        
        // Fetch topics
        const { data: topicsData, error: topicsError } = await supabase
          .from('forum_topics')
          .select(`
            *,
            profile:profiles(username, display_name, profile_picture)
          `)
          .eq('category_id', categoryData.id)
          .order('is_sticky', { ascending: false })
          .order('last_post_at', { ascending: false })
          .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);
          
        if (topicsError) throw topicsError;
        
        // Get post counts for each topic and map profile_picture
        const topicsWithCountsAndMappedProfiles = await Promise.all((topicsData || []).map(async (topic) => {
          const { count: postCount, error: postCountError } = await supabase
            .from('forum_posts')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topic.id);

          if (postCountError) {
            console.error(`Error fetching post count for topic ${topic.id}:`, postCountError);
          }
          
          // Map profile_picture to avatar_url
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { profile_picture, ...restOfProfileDetails } = topic.profile || {};
          const newProfile = topic.profile 
            ? { ...restOfProfileDetails, avatar_url: profile_picture } 
            : undefined;
            
          return {
            ...topic,
            profile: newProfile,
            _count: {
              posts: postCount || 0
            }
          } as ForumTopic;
        }));
        
        setTopics(topicsWithCountsAndMappedProfiles);
      } catch (error: any) {
        console.error('Error fetching forum data:', error.message);
        toast({
          title: "Error loading forum",
          description: "We couldn't load the forum data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategory();
  }, [categorySlug, navigate, page]);
  
  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 px-4 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in the useEffect
  }
  
  if (!category) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium mb-2">Category not found</p>
              <p className="text-muted-foreground mb-4">
                The forum category you're looking for doesn't exist.
              </p>
              <Button asChild>
                <Link to="/members">Back to Forum</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
              )}
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to={`/members/forum/${categorySlug}/new`}>
                <PlusCircle className="h-4 w-4 mr-2" /> New Topic
              </Link>
            </Button>
          </div>
          
          <div className="mb-6">
            <Link to="/members" className="text-sm text-primary hover:underline">
              &larr; Back to Forum
            </Link>
          </div>
          
          <Card className="border-primary/20">
            <CardHeader className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 py-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-7 sm:col-span-8">
                  <CardTitle className="text-sm sm:text-base">Topic</CardTitle>
                </div>
                <div className="hidden sm:block sm:col-span-1">
                  <CardTitle className="text-sm text-center">Replies</CardTitle>
                </div>
                <div className="col-span-5 sm:col-span-3">
                  <CardTitle className="text-sm text-right sm:text-center">Latest Post</CardTitle>
                </div>
              </div>
            </CardHeader>
            
            {topics.length === 0 ? (
              <CardContent className="py-12 text-center">
                <p className="text-lg font-medium mb-2">No topics found</p>
                <p className="text-muted-foreground mb-4">
                  Be the first to start a discussion in this category!
                </p>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link to={`/members/forum/${categorySlug}/new`}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Create Topic
                  </Link>
                </Button>
              </CardContent>
            ) : (
              <CardContent className="p-0">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {topics.map((topic) => (
                    <li key={topic.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-7 sm:col-span-8">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                              <AvatarImage src={topic.profile?.avatar_url || ''} alt={topic.profile?.display_name || 'User'} />
                              <AvatarFallback className="bg-primary/20 text-primary-foreground">
                                {(topic.profile?.display_name?.[0] || topic.profile?.username?.[0] || 'U').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <Link 
                                  to={`/members/forum/${categorySlug}/${topic.id}`}
                                  className="font-medium hover:text-primary transition-colors line-clamp-1"
                                >
                                  {topic.title}
                                </Link>
                                {topic.is_sticky && (
                                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">Pinned</Badge>
                                )}
                                {topic.is_locked && (
                                  <Badge variant="destructive" className="text-xs">Locked</Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                by {topic.profile?.display_name || topic.profile?.username || 'Anonymous'} •{' '}
                                {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="hidden sm:flex sm:col-span-1 items-center justify-center">
                          <span className="font-medium">{(topic._count?.posts || 1) -1 }</span> {/* Display replies, not total posts */}
                        </div>
                        <div className="col-span-5 sm:col-span-3 flex items-center justify-end sm:justify-center">
                          <span className="text-xs text-right sm:text-center text-muted-foreground">
                            {formatDistanceToNow(new Date(topic.last_post_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                
                {totalPages > 1 && (
                  <div className="py-4 px-4 border-t">
                    <Pagination>
                      <PaginationContent>
                        {page > 1 && (
                          <PaginationItem>
                            <PaginationPrevious 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(page - 1);
                              }}
                            />
                          </PaginationItem>
                        )}
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(pageNum => 
                            pageNum === 1 || 
                            pageNum === totalPages || 
                            (pageNum >= page - 1 && pageNum <= page + 1)
                          )
                          .map((pageNum, i, arr) => {
                            // Add ellipsis
                            if (i > 0 && pageNum > arr[i-1] + 1) {
                              return (
                                <React.Fragment key={`ellipsis-${pageNum}`}>
                                  <PaginationItem>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                  <PaginationItem>
                                    <PaginationLink
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setPage(pageNum);
                                      }}
                                      isActive={page === pageNum}
                                    >
                                      {pageNum}
                                    </PaginationLink>
                                  </PaginationItem>
                                </React.Fragment>
                              );
                            }
                            
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setPage(pageNum);
                                  }}
                                  isActive={page === pageNum}
                                  className={page === pageNum ? "bg-primary text-primary-foreground" : ""}
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })
                        }
                        
                        {page < totalPages && (
                          <PaginationItem>
                            <PaginationNext 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(page + 1);
                              }}
                            />
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
          
          <div className="mt-8 text-center text-muted-foreground text-sm">
            <p>Showing topics in {category.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumCategoryPage;
