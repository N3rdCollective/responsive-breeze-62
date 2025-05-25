
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/profile'; // Ensure UserProfile has avatar_url

export const useUserSearch = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsersByName = useCallback(async (searchTerm: string, currentUserId: string) => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setUsers([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .select('id, username, display_name, profile_picture') // profile_picture is the column name
        .or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
        .neq('id', currentUserId) // Exclude the current user from search results
        .limit(10);

      if (supabaseError) {
        throw supabaseError;
      }
      
      // Map profile_picture to avatar_url as expected by UserProfile type
      const fetchedUsers = data
        ? data.map(profile => ({
            id: profile.id,
            username: profile.username,
            display_name: profile.display_name,
            avatar_url: profile.profile_picture, // Mapping here
            // Add other required UserProfile fields with default/null values if not selected
            bio: null,
            favorite_genres: null,
            role: 'user', // Or fetch if available/needed
            social_links: null,
            theme: null,
            is_public: true,
            created_at: '', // Or fetch if available/needed
            forum_signature: null,
            forum_post_count: 0, // Or fetch if available/needed
          }))
        : [];
      setUsers(fetchedUsers);

    } catch (err: any) {
      console.error('Error searching users:', err);
      setError(err.message || 'Failed to search users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { users, isLoading, error, searchUsersByName };
};
