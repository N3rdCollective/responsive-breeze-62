
import { supabase } from "@/integrations/supabase/client";
import { NewsPostData } from "../types/newsPostTypes";
import { PostgrestResponse } from "@supabase/supabase-js";

/**
 * Prepare post data for database storage
 */
export const preparePostData = (
  postData: NewsPostData,
  featuredImageUrl: string | null
) => {
  const { id, title, content, excerpt, status, category, tags, staffName } = postData;
  
  // Base data that's common for both create and update
  const baseData = {
    title,
    content,
    excerpt,
    status,
    category,
    tags,
    updated_at: new Date().toISOString(),
    featured_image: featuredImageUrl
  };
  
  // For new posts only, set the author and author_name
  // For existing posts (updates), don't modify these fields
  if (!id) {
    return {
      ...baseData,
      author: null, // Will be set to auth.uid() via RLS if authenticated
      author_name: staffName, // Only set author_name on initial creation
      post_date: new Date().toISOString()
    };
  }
  
  // For updates, return only the modified fields without author details
  return baseData;
};

/**
 * Create a new post in the database
 */
export const createNewsPost = async (postData: any) => {
  try {
    const response = await supabase
      .from('posts')
      .insert(postData)
      .select('id');
    
    return response;
  } catch (error) {
    console.error("Error creating news post:", error);
    return { error, data: null }; // Ensure consistent return shape
  }
};

/**
 * Update an existing post in the database
 */
export const updateNewsPost = async (id: string, postData: any) => {
  try {
    console.log("Updating post with ID:", id);
    console.log("Update data:", postData);
    
    const response = await supabase
      .from('posts')
      .update(postData)
      .eq('id', id)
      .select('id');
    
    return response;
  } catch (error) {
    console.error("Error updating news post:", error);
    return { error, data: null }; // Ensure consistent return shape
  }
};

/**
 * Fetch a post after update to verify changes
 */
export const fetchUpdatedPost = async (id: string) => {
  try {
    const response = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    
    return response;
  } catch (error) {
    console.error("Error fetching updated post:", error);
    return { error, data: null }; // Ensure consistent return shape
  }
};
