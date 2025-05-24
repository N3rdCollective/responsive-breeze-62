
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
    
    // Fetch base user data from profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, display_name, profile_picture, created_at, role, updated_at')
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
      // Fetch forum post counts
      const { data: forumPostCountsData, error: forumPostCountsError } = await supabase
        .from('forum_posts')
        .select('user_id, id')
        .in('user_id', userIds);

      if (forumPostCountsError) {
        console.warn('Error fetching forum post counts:', forumPostCountsError.message);
      }

      // Fetch timeline post counts
      const { data: timelinePostCountsData, error: timelinePostCountsError } = await supabase
        .from('timeline_posts')
        .select('user_id, id')
        .in('user_id', userIds);
      
      if (timelinePostCountsError) {
        console.warn('Error fetching timeline post counts:', timelinePostCountsError.message);
      }

      // Fetch pending report counts
      const { data: pendingReportCountsData, error: pendingReportCountsError } = await supabase
        .from('content_reports')
        .select('reported_user_id, id')
        .in('reported_user_id', userIds)
        .eq('status', 'pending');

      if (pendingReportCountsError) {
        console.warn('Error fetching pending report counts:', pendingReportCountsError.message);
      }
      
      mappedUsers = profilesData.map(profile => {
        const forum_post_count = forumPostCountsData?.filter(p => p.user_id === profile.id).length || 0;
        const timeline_post_count = timelinePostCountsData?.filter(p => p.user_id === profile.id).length || 0;
        const pending_report_count = pendingReportCountsData?.filter(p => p.reported_user_id === profile.id).length || 0;

        // Use fallbacks for potentially missing columns
        const profileStatus = (profile as any).status || 'active';
        const profileLastActive = (profile as any).last_active || profile.updated_at || profile.created_at;

        return {
          id: profile.id,
          username: profile.username || 'N/A',
          display_name: profile.display_name || profile.username || 'Anonymous',
          email: 'Email N/A', // Email is not on profiles table per schema
          profile_picture: profile.profile_picture || undefined,
          created_at: profile.created_at,
          last_active: profileLastActive,
          forum_post_count,
          timeline_post_count,
          pending_report_count,
          status: profileStatus as User['status'],
          role: (profile.role as User['role']) || 'user',
        };
      });
    }
    
    console.log("Users fetched and mapped:", mappedUsers.length);
    return { users: mappedUsers, error: null };
  } catch (err: any) {
    console.error('Error in fetchUserData:', err);
    return { users: [], error: err.message };
  }
};
