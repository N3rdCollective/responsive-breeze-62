
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  pendingReports: number;
  activeTopics: number;
  usersTrend: string;
  postsTrend: string;
  topicsTrend: string;
  recentActivity: Array<{
    action: string;
    time: string;
    status: 'success' | 'warning' | 'error' | 'info';
  }>;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    pendingReports: 0,
    activeTopics: 0,
    usersTrend: '+0%',
    postsTrend: '+0%',
    topicsTrend: '+0%',
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current date ranges for trend calculations
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch users from last week for trend
      const { count: usersWeekAgo } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      // Fetch active users (users active in last 24 hours)
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_active', yesterday.toISOString());

      // Fetch total posts
      const { count: totalPosts } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });

      // Fetch posts from last week for trend
      const { count: postsWeekAgo } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      // Fetch pending reports
      const { count: pendingReports } = await supabase
        .from('content_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch active topics
      const { count: activeTopics } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact', head: true })
        .eq('is_locked', false);

      // Fetch topics from last week for trend
      const { count: topicsWeekAgo } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      // Fetch recent staff activity
      const { data: activityData } = await supabase
        .from('staff_activity_logs')
        .select(`
          action_type,
          description,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      // Calculate trends
      const calculateTrend = (current: number, previous: number): string => {
        if (previous === 0) return current > 0 ? '+100%' : '0%';
        const change = ((current - previous) / previous) * 100;
        return change >= 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`;
      };

      const usersTrend = calculateTrend(totalUsers || 0, (totalUsers || 0) - (usersWeekAgo || 0));
      const postsTrend = calculateTrend(totalPosts || 0, (totalPosts || 0) - (postsWeekAgo || 0));
      const topicsTrend = calculateTrend(activeTopics || 0, (activeTopics || 0) - (topicsWeekAgo || 0));

      // Format recent activity
      const formatRelativeTime = (timestamp: string): string => {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      };

      const getActivityStatus = (actionType: string): 'success' | 'warning' | 'error' | 'info' => {
        if (actionType.includes('create') || actionType.includes('publish')) return 'success';
        if (actionType.includes('report') || actionType.includes('warn')) return 'warning';
        if (actionType.includes('delete') || actionType.includes('ban')) return 'error';
        return 'info';
      };

      const recentActivity = (activityData || []).map(activity => ({
        action: activity.description,
        time: formatRelativeTime(activity.created_at),
        status: getActivityStatus(activity.action_type)
      }));

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalPosts: totalPosts || 0,
        pendingReports: pendingReports || 0,
        activeTopics: activeTopics || 0,
        usersTrend,
        postsTrend,
        topicsTrend,
        recentActivity
      });

    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats
  };
};
