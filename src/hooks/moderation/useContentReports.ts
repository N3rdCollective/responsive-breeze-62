import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContentReport {
  id: string;
  content_type: string;
  content_id: string;
  content_preview: string;
  report_reason: string;
  status: 'pending' | 'resolved' | 'rejected';
  created_at: string;
  updated_at: string;
  reporter_name: string;
  reporter_avatar: string;
  reported_user_id: string; // Added this field
  reported_user_name: string;
  reported_user_avatar: string;
  topic_id: string | null;
  topic_title: string | null;
  moderator_name: string | null;
  action_type: string | null;
  action_note: string | null;
  action_created_at: string | null;
}

export interface NewContentReportPayload {
  contentType: 'post' | 'topic';
  contentId: string;
  reportedUserId: string;
  reportReason: string;
  contentPreview?: string; // Optional: a snippet of the content being reported
  topicId?: string; // Optional: if the content is a post, its parent topic ID
}

export const useContentReports = () => {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      // The RPC function 'get_content_reports_with_details' now returns reported_user_id
      const { data, error } = await supabase.rpc('get_content_reports_with_details');
      
      if (error) {
        console.error('Error fetching reports:', error);
        setError(error.message);
        return;
      }

      const typedReports = (data || []).map(report => ({
        ...report,
        status: validateReportStatus(report.status)
      })) as ContentReport[];

      setReports(typedReports);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to validate and convert status to the correct type
  const validateReportStatus = (status: string): 'pending' | 'resolved' | 'rejected' => {
    if (status === 'pending' || status === 'resolved' || status === 'rejected') {
      return status;
    }
    // Default to pending if an unexpected status is encountered
    console.warn(`Unexpected report status: ${status}, defaulting to 'pending'`);
    return 'pending';
  };

  const updateReportStatus = async (reportId: string, status: 'pending' | 'resolved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('content_reports')
        .update({ status })
        .eq('id', reportId);

      if (error) {
        console.error('Error updating report status:', error);
        toast({
          title: "Error",
          description: "Failed to update report status",
          variant: "destructive"
        });
        return false;
      }

      // Refresh reports after update
      await fetchReports();
      toast({
        title: "Status Updated",
        description: `Report status changed to ${status}.`,
      });
      return true;
    } catch (err: any) {
      console.error('Error updating report status:', err);
      toast({
        title: "Error", 
        description: "Failed to update report status",
        variant: "destructive"
      });
      return false;
    }
  };

  const createModerationAction = async (
    reportId: string, 
    actionType: string, 
    actionNote: string = ''
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to report content.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('moderation_actions')
        .insert({
          report_id: reportId,
          moderator_id: user.id,
          action_type: actionType,
          action_note: actionNote
        });

      if (error) {
        console.error('Error creating moderation action:', error);
        toast({
          title: "Error",
          description: "Failed to create moderation action",
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (err: any) {
      console.error('Error creating moderation action:', err);
      toast({
        title: "Error",
        description: "Failed to create moderation action", 
        variant: "destructive"
      });
      return false;
    }
  };

  const createContentReport = async (payload: NewContentReportPayload): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to report content.",
          variant: "destructive",
        });
        return false;
      }

      const { error: reportError } = await supabase
        .from('content_reports')
        .insert({
          content_type: payload.contentType,
          content_id: payload.contentId,
          reporter_id: user.id,
          reported_user_id: payload.reportedUserId,
          report_reason: payload.reportReason,
          content_preview: payload.contentPreview,
          topic_id: payload.topicId,
          status: 'pending',
        });

      if (reportError) {
        console.error('Error creating content report:', reportError);
        toast({
          title: "Report Submission Failed",
          description: reportError.message || "Could not submit your report. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Report Submitted",
        description: "Thank you, your report has been submitted for review.",
      });
      // Optionally, refresh reports list if displayed to moderators immediately
      // await fetchReports(); 
      return true;
    } catch (err: any) {
      console.error('Error in createContentReport:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while submitting your report.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Placeholder function for removing content
  const removeContentOnDb = async (contentId: string, contentType: 'post' | 'topic'): Promise<boolean> => {
    console.log(`Simulating removal of ${contentType} with ID: ${contentId}`);
    // In a real scenario, this would involve:
    // 1. Supabase call to delete/archive the post or topic.
    // 2. For topics, consider what happens to its posts.
    // For now, we just log and toast success.
    toast({
      title: "Content Action (Simulated)",
      description: `${contentType === 'post' ? 'Post' : 'Topic'} with ID ${contentId} would be removed.`,
    });
    return true; 
  };

  // Placeholder function for locking a topic
  const lockTopicOnDb = async (topicId: string): Promise<boolean> => {
    console.log(`Simulating locking of topic with ID: ${topicId}`);
    // In a real scenario, this would involve:
    // 1. Supabase call to update the 'is_locked' status of the forum_topics table.
    // For now, we just log and toast success.
    toast({
      title: "Topic Action (Simulated)",
      description: `Topic with ID ${topicId} would be locked/unlocked.`,
    });
    return true;
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    error,
    fetchReports,
    updateReportStatus,
    createModerationAction,
    createContentReport,
    removeContentOnDb, // Export new function
    lockTopicOnDb,     // Export new function
  };
};
