
import { supabase } from "@/integrations/supabase/client";
import { NewsPostData } from "../types/newsPostTypes";

/**
 * Creates a new post in the database
 */
export const createNewsPost = async (newsData: any) => {
  console.log("Creating new post with status:", newsData.status);
  
  const newPost = {
    ...newsData,
    status: newsData.status,
    created_at: new Date().toISOString(),
    post_date: new Date().toISOString(),
  };
  
  const { data, error } = await supabase
    .from("posts")
    .insert([newPost])
    .select();
    
  return { data, error };
};

/**
 * Updates an existing post in the database
 */
export const updateNewsPost = async (id: string, newsData: any) => {
  console.log("Updating existing post with ID:", id);
  console.log("Updating status to:", newsData.status);
  
  // Make a direct, explicit update with status
  const { data, error } = await supabase
    .from("posts")
    .update({
      ...newsData,
      status: newsData.status // Ensure status is explicitly set
    })
    .eq("id", id);
    
  return { data, error };
};

/**
 * Fetches the updated post to confirm changes
 */
export const fetchUpdatedPost = async (id: string) => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
    
  if (error) {
    console.error("Error fetching updated post:", error);
  } else {
    console.log("Post updated successfully, fetched data:", data);
    console.log("Confirmed status after update:", data?.status);
  }
  
  return { data, error };
};

/**
 * Prepares post data for saving to database
 */
export const preparePostData = (postData: NewsPostData, featuredImageUrl: string) => {
  const { title, content, status, excerpt, category, tags, staffName } = postData;
  
  return {
    title,
    content,
    status, // Ensure status is explicitly included and not overridden
    excerpt,
    featured_image: featuredImageUrl || null,
    tags: tags || [],
    updated_at: new Date().toISOString(),
    author_name: staffName || 'Staff Author',
    category: category || 'Uncategorized'
  };
};
