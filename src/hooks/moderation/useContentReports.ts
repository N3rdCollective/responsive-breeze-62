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
  reported_user_id: string; 
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
  contentPreview?: string; 
  topicId?: string; 
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

  const removeContentOnDb = async (contentId: string, contentType: 'post' | 'topic'): Promise<boolean> => {
    try {
      let tableName: string;
      if (contentType === 'post') {
        tableName = 'forum_posts';
      } else if (contentType === 'topic') {
        tableName = 'forum_topics';
      } else {
        toast({ title: "Error", description: "Invalid content type for removal.", variant: "destructive" });
        return false;
      }

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', contentId);

      if (error) {
        console.error(`Error removing ${contentType}:`, error);
        toast({ title: "Error", description: `Failed to remove ${contentType}.`, variant: "destructive" });
        return false;
      }

      toast({ title: "Content Removed", description: `The ${contentType} has been successfully removed.` });
      return true;
    } catch (err: any) {
      console.error(`Error removing ${contentType}:`, err);
      toast({ title: "Error", description: `An unexpected error occurred while removing ${contentType}.`, variant: "destructive" });
      return false;
    }
  };

  const lockTopicOnDb = async (topicId: string): Promise<{ success: boolean; locked?: boolean }> => {
    try {
      const { data: topicData, error: fetchError } = await supabase
        .from('forum_topics')
        .select('is_locked')
        .eq('id', topicId)
        .single();

      if (fetchError || !topicData) {
        console.error('Error fetching topic lock status:', fetchError);
        toast({ title: "Error", description: "Could not fetch topic details to update lock status.", variant: "destructive" });
        return { success: false };
      }

      const newLockStatus = !topicData.is_locked;

      const { error: updateError } = await supabase
        .from('forum_topics')
        .update({ is_locked: newLockStatus })
        .eq('id', topicId);

      if (updateError) {
        console.error('Error updating topic lock status:', updateError);
        toast({ title: "Error", description: "Failed to update topic lock status.", variant: "destructive" });
        return { success: false };
      }

      toast({ 
        title: "Topic Status Updated", 
        description: `Topic has been ${newLockStatus ? 'locked' : 'unlocked'}.` 
      });
      return { success: true, locked: newLockStatus };
    } catch (err: any) {
      console.error('Error updating topic lock status:', err);
      toast({ title: "Error", description: "An unexpected error occurred while updating topic lock status.", variant: "destructive" });
      return { success: false };
    }
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
    removeContentOnDb,
    lockTopicOnDb,
  };
};
