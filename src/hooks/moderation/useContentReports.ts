
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
  reported_user_name: string;
  reported_user_avatar: string;
  topic_id: string | null;
  topic_title: string | null;
  moderator_name: string | null;
  action_type: string | null;
  action_note: string | null;
  action_created_at: string | null;
}

export const useContentReports = () => {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_content_reports_with_details');
      
      if (error) {
        console.error('Error fetching reports:', error);
        setError(error.message);
        return;
      }

      // Cast and validate the status field to ensure it matches our expected types
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

  const updateReportStatus = async (reportId: string, status: 'resolved' | 'rejected') => {
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
        throw new Error('User not authenticated');
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

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    error,
    fetchReports,
    updateReportStatus,
    createModerationAction
  };
};
