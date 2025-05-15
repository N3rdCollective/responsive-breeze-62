
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, LockIcon } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useForum } from "@/hooks/useForum";
import { ForumPost, ForumTopic } from "@/types/forum";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const ForumTopicPage = () => {
  const { categorySlug, topicId } = useParams<{ categorySlug: string, topicId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { createPost, submitting, incrementViewCount } = useForum();
  
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
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
    const fetchTopic = async () => {
      if (!topicId) return;
      
      try {
        setLoading(true);
        
        // Fetch topic
        const { data: topicData, error: topicError } = await supabase
          .from('forum_topics')
          .select(`
            *,
            profile:profiles(username, display_name, avatar_url),
            category:forum_categories(name, slug)
          `)
          .eq('id', topicId)
          .single();
          
        if (topicError) throw topicError;
        
        if (!topicData) {
          navigate('/members');
          toast({
            title: "Topic not found",
            description: "The forum topic you're looking for doesn't exist.",
            variant: "destructive"
          });
          return;
        }
        
        // Check if category slug matches
        if (topicData.category.slug !== categorySlug) {
          navigate(`/members/forum/${topicData.category.slug}/${topicId}`);
          return;
        }
        
        setTopic(topicData as ForumTopic);
        
        // Count total posts for pagination
        const { count, error: countError } = await supabase
          .from('forum_posts')
          .select('*', { count: 'exact', head: true })
          .eq('topic_id', topicId);
          
        if (countError) throw countError;
        
        const totalPageCount = Math.ceil((count || 0) / ITEMS_PER_PAGE);
        setTotalPages(totalPageCount || 1);
        
        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from('forum_posts')
          .select(`
            *,
            profile:profiles(username, display_name, avatar_url)
          `)
          .eq('topic_id', topicId)
          .order('created_at', { ascending: true })
          .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);
          
        if (postsError) throw postsError;
        
        setPosts(postsData as ForumPost[]);
        
        // Increment view count
        if (page === 1) {
          incrementViewCount(topicId);
        }
      } catch (error: any) {
        console.error('Error fetching topic data:', error.message);
        toast({
          title: "Error loading topic",
          description: "We couldn't load the topic data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopic();
  }, [topicId, categorySlug, navigate, page]);
  
  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      toast({
        title: "Empty reply",
        description: "Please enter a message for your reply.",
        variant: "destructive"
      });
      return;
    }
    
    if (!topicId) return;
    
    if (topic?.is_locked) {
      toast({
        title: "Topic is locked",
        description: "This topic is locked and cannot be replied to.",
        variant: "destructive"
      });
      return;
    }
    
    const result = await createPost({
      topic_id: topicId,
      content: replyContent
    });
    
    if (result) {
      setReplyContent("");
      // Add the new post to the list if we're on the last page
      if (page === totalPages) {
        setPosts(prev => [...prev, result as unknown as ForumPost]);
      } else {
        // Navigate to the last page
        setPage(totalPages);
      }
    }
  };
  
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
  
  if (!topic) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium mb-2">Topic not found</p>
              <p className="text-muted-foreground mb-4">
                The forum topic you're looking for doesn't exist.
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
  
  // Get category data from topic object
  const categoryName = topic.category?.name || '';
  const categorySlugPath = topic.category?.slug || categorySlug; 
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="pt-20 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {topic.title}
                {topic.is_locked && (
                  <LockIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </h1>
              <div className="text-sm text-muted-foreground mt-1">
                Posted in <Link to={`/members/forum/${categorySlugPath}`} className="text-primary hover:underline">{categoryName}</Link>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <Link to={`/members/forum/${categorySlugPath}`} className="text-sm text-primary hover:underline">
              &larr; Back to {categoryName}
            </Link>
          </div>
          
          <div className="space-y-6">
            {posts.map((post, index) => (
              <Card key={post.id} id={`post-${post.id}`} className={`${index === 0 ? "border-primary" : "border-primary/20"} overflow-hidden`}>
                <CardHeader className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80 py-3 px-4 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                      <AvatarImage src={post.profile?.avatar_url || ''} alt={post.profile?.display_name || 'User'} />
                      <AvatarFallback className="bg-primary/20 text-primary-foreground">
                        {(post.profile?.display_name?.[0] || post.profile?.username?.[0] || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium">
                        {post.profile?.display_name || post.profile?.username || 'Anonymous'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    {post.is_edited && ' (edited)'}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pb-6">
                  <div className="prose dark:prose-invert max-w-none">
                    {post.content.split("\n").map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {totalPages > 1 && (
              <div className="py-4">
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
                                <span className="flex h-9 w-9 items-center justify-center">...</span>
                              </PaginationItem>
                              <PaginationItem>
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
            
            {!topic.is_locked ? (
              <Card className="border-primary/20">
                <CardHeader className="py-3 px-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80">
                  <CardTitle className="text-lg">Post a Reply</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <form onSubmit={handleSubmitReply}>
                    <Textarea
                      className="min-h-[120px] mb-4 border-primary/20 focus-visible:ring-primary"
                      placeholder="Write your reply here..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      disabled={submitting}
                    />
                    <Button 
                      type="submit" 
                      disabled={submitting || !replyContent.trim()}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        'Post Reply'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-6 text-center">
                  <LockIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">This topic is locked and cannot be replied to.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumTopicPage;
