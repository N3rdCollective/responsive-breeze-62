
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ModerationStats {
  pendingReports: number;
  resolvedToday: number;
  newMembers: number;
  activeTopics: number;
  topCategories: Array<{ name: string; count: number }>;
  flaggedUsers: Array<{ name: string; flags: number }>;
}

export const useModerationStats = () => {
  const [stats, setStats] = useState<ModerationStats>({
    pendingReports: 0,
    resolvedToday: 0,
    newMembers: 0,
    activeTopics: 0,
    topCategories: [],
    flaggedUsers: []
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Get pending reports count
      const { count: pendingCount } = await supabase
        .from('content_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get resolved reports today
      const today = new Date().toISOString().split('T')[0];
      const { count: resolvedToday } = await supabase
        .from('content_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved')
        .gte('updated_at', `${today}T00:00:00.000Z`)
        .lt('updated_at', `${today}T23:59:59.999Z`);

      // Get new members today
      const { count: newMembers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      // Get active topics count
      const { count: activeTopics } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact', head: true })
        .eq('is_locked', false);

      // Get top categories by topic count
      const { data: categoryStats } = await supabase
        .from('forum_topics')
        .select(`
          category_id,
          forum_categories!inner(name)
        `);

      const categoryGroups: { [key: string]: number } = {};
      categoryStats?.forEach(topic => {
        const categoryName = (topic.forum_categories as any)?.name || 'Unknown';
        categoryGroups[categoryName] = (categoryGroups[categoryName] || 0) + 1;
      });

      const topCategories = Object.entries(categoryGroups)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Get flagged users (users with multiple reports against them)
      const { data: flaggedUsersData } = await supabase
        .from('content_reports')
        .select(`
          reported_user_id,
          profiles!content_reports_reported_user_id_fkey(display_name, username)
        `);

      const userFlags: { [key: string]: { name: string; count: number } } = {};
      flaggedUsersData?.forEach(report => {
        const userId = report.reported_user_id;
        const profile = report.profiles as any;
        const userName = profile?.display_name || profile?.username || 'Unknown User';
        
        if (!userFlags[userId]) {
          userFlags[userId] = { name: userName, count: 0 };
        }
        userFlags[userId].count++;
      });

      const flaggedUsers = Object.values(userFlags)
        .filter(user => user.count > 1)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(user => ({ name: user.name, flags: user.count }));

      setStats({
        pendingReports: pendingCount || 0,
        resolvedToday: resolvedToday || 0,
        newMembers: newMembers || 0,
        activeTopics: activeTopics || 0,
        topCategories,
        flaggedUsers
      });

    } catch (error) {
      console.error('Error fetching moderation stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    fetchStats
  };
};
