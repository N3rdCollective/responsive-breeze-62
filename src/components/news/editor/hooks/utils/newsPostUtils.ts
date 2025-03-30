
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
  
  // Add explicit debug logging
  console.log("Creating new post with data:", JSON.stringify(newPost));
  
  const { data, error } = await supabase
    .from("posts")
    .insert([newPost])
    .select();
    
  if (error) {
    console.error("Error creating post:", error);
    throw error; // Throw the error to be caught by the caller
  } else {
    console.log("Post created successfully:", data);
  }
    
  return { data, error };
};

/**
 * Updates an existing post in the database
 */
export const updateNewsPost = async (id: string, newsData: any) => {
  console.log("Updating existing post with ID:", id);
  console.log("Updating with data:", JSON.stringify(newsData));
  console.log("Updating status to:", newsData.status);
  
  // Create a separate object for the update to ensure we're not sending any undefined values
  const updateData = {
    title: newsData.title,
    content: newsData.content,
    excerpt: newsData.excerpt,
    status: newsData.status, // Explicitly include status
    featured_image: newsData.featured_image,
    tags: newsData.tags || [],
    author_name: newsData.author_name,
    category: newsData.category || 'Uncategorized',
    updated_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", id)
      .select();
      
    if (error) {
      console.error("Error updating post:", error);
      throw error; // Throw the error to be caught by the caller
    } else {
      console.log("Post update query executed, checking result...");
      console.log("Updated data:", data);
      
      // Verify the update by fetching the post again
      const verifiedResult = await fetchUpdatedPost(id);
      return { data: verifiedResult.data, error: null };
    }
  } catch (err) {
    console.error("Exception in updateNewsPost:", err);
    throw err;
  }
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
  } else if (data) {
    console.log("Post updated successfully, fetched data:", data);
    console.log("Confirmed status after update:", data.status);
  } else {
    console.error("No data returned when fetching updated post");
  }
  
  return { data, error };
};

/**
 * Prepares post data for saving to database
 */
export const preparePostData = (postData: NewsPostData, featuredImageUrl: string) => {
  const { title, content, status, excerpt, category, tags, staffName } = postData;
  
  const prepared = {
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
  
  console.log("Prepared post data with status:", prepared.status);
  
  return prepared;
};
