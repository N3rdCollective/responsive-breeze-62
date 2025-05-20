
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { ForumCategory, ForumTopic } from "@/types/forum";

import ForumCategoryHeader from "@/components/forum/ForumCategoryHeader";
import TopicList from "@/components/forum/TopicList";
import ForumPagination from "@/components/forum/ForumPagination";

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
    const fetchCategoryAndTopics = async () => {
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
          navigate('/members'); // Redirect to forum index if category not found
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
        setTotalPages(totalPageCount || 1); // Ensure totalPages is at least 1
        
        // Fetch topics
        const { data: topicsRawData, error: topicsError } = await supabase
          .from('forum_topics')
          .select(`
            id,
            title,
            slug,
            is_sticky,
            is_locked,
            created_at,
            last_post_at,
            user_id,
            category_id,
            profile:profiles!forum_topics_user_id_fkey(username, display_name, profile_picture)
          `)
          .eq('category_id', categoryData.id)
          .order('is_sticky', { ascending: false })
          .order('last_post_at', { ascending: false })
          .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);
          
        if (topicsError) throw topicsError;
        
        // Get post counts for each topic and map profile_picture
        const topicsWithCountsAndMappedProfiles = await Promise.all((topicsRawData || []).map(async (topic) => {
          const { count: postCount, error: postCountError } = await supabase
            .from('forum_posts')
            .select('*', { count: 'exact', head: true })
            .eq('topic_id', topic.id);

          if (postCountError) {
            console.error(`Error fetching post count for topic ${topic.id}:`, postCountError);
          }
          
          const profileData = topic.profile as { username?: string | null; display_name?: string | null; profile_picture?: string | null; } | null;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { profile_picture, ...restOfProfileDetails } = profileData || {};
          const newProfile = profileData
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
    
    fetchCategoryAndTopics();
  }, [categorySlug, navigate, page]); // Removed category from dependencies as it's set within this effect
  
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
    // This should ideally not be reached if the redirect in useEffect works correctly
    // but as a fallback:
    return (
       <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 px-4 flex justify-center items-center">
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }
  
  if (!category) {
    // This state is handled by the redirect or toast in useEffect, 
    // but as a fallback if navigation hasn't completed:
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg font-medium mb-2">Category not found</p>
              <p className="text-muted-foreground mb-4">
                The forum category you're looking for doesn't exist or you were redirected.
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
          <ForumCategoryHeader category={category} categorySlug={categorySlug} />
          
          <div className="mb-6">
            <Link to="/members" className="text-sm text-primary hover:underline">
              &larr; Back to Forum
            </Link>
          </div>
          
          <TopicList topics={topics} categorySlug={categorySlug} />
          
          {topics.length > 0 && totalPages > 1 && (
             <ForumPagination page={page} totalPages={totalPages} setPage={setPage} />
          )}
          
          <div className="mt-8 text-center text-muted-foreground text-sm">
            <p>Showing topics in {category.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumCategoryPage;
