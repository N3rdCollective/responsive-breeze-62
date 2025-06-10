
import { supabase } from '@/integrations/supabase/client';
import { User } from './userTypes';

/**
 * Fetch users with counts of their posts and reports
 */
export const fetchUserData = async (): Promise<{ 
  users: User[], 
  error: string | null 
}> => {
  try {
    console.log("Fetching user data");
    
    // Fetch base user data from profiles, including status and last_active
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, display_name, profile_picture, created_at, role, updated_at, forum_signature, forum_post_count, status, last_active') // Added status and last_active
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error("Error fetching from profiles table:", profilesError);
      return { users: [], error: profilesError.message };
    }

    if (!profilesData) {
      return { users: [], error: null };
    }

    const userIds = profilesData.map(p => p.id);
    let mappedUsers: User[] = [];

    if (userIds.length > 0) {
      // Timeline post counts (if still needed separately, or if it's a different count)
      const { data: timelinePostCountsData, error: timelinePostCountsError } = await supabase
        .from('timeline_posts')
        .select('user_id, id')
        .in('user_id', userIds);
      
      if (timelinePostCountsError) {
        console.warn('Error fetching timeline post counts:', timelinePostCountsError.message);
      }

      // Pending report counts
      const { data: pendingReportCountsData, error: pendingReportCountsError } = await supabase
        .from('content_reports')
        .select('reported_user_id, id')
        .in('reported_user_id', userIds)
        .eq('status', 'pending');

      if (pendingReportCountsError) {
        console.warn('Error fetching pending report counts:', pendingReportCountsError.message);
      }
      
      mappedUsers = profilesData.map(profile => {
        const timeline_post_count = timelinePostCountsData?.filter(p => p.user_id === profile.id).length || 0;
        const pending_report_count = pendingReportCountsData?.filter(p => p.reported_user_id === profile.id).length || 0;

        // Use the actual status from the database, fallback to 'active' if null
        const profileStatus = profile.status || 'active';
        // Use last_active from database, fallback to updated_at or created_at
        const profileLastActive = profile.last_active || profile.updated_at || profile.created_at;

        console.log(`User ${profile.username} status from DB:`, profileStatus); // Debug log

        return {
          id: profile.id,
          username: profile.username || 'N/A',
          display_name: profile.display_name || profile.username || 'Anonymous',
          email: 'Email N/A', 
          profile_picture: profile.profile_picture || undefined,
          created_at: profile.created_at, // This is the user's join date
          last_active: profileLastActive,
          forum_post_count: profile.forum_post_count || 0, // Use directly from profile
          forum_signature: profile.forum_signature || null, // Add forum signature
          timeline_post_count,
          pending_report_count,
          status: profileStatus as User['status'], // Use the status from database
          role: (profile.role as User['role']) || 'user',
        };
      });
    }
    
    console.log("Users fetched and mapped:", mappedUsers.length);
    console.log("User statuses:", mappedUsers.map(u => ({ username: u.username, status: u.status }))); // Debug log
    return { users: mappedUsers, error: null };
  } catch (err: any) {
    console.error('Error in fetchUserData:', err);
    return { users: [], error: err.message };
  }
};
