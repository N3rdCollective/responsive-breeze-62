import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useSubmissionReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const trackDownload = useMutation({
    mutationFn: async (submissionId: string) => {
      const { error } = await supabase
        .from('show_submissions')
        .update({
          downloaded_by: (await supabase.auth.getUser()).data.user?.id,
          downloaded_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-submissions'] });
    }
  });

  const deleteFile = useMutation({
    mutationFn: async ({ submissionId, audioUrl }: { submissionId: string; audioUrl: string }) => {
      // Extract file path from URL
      const urlParts = audioUrl.split('/show-submissions/');
      if (urlParts.length < 2) throw new Error('Invalid file URL');
      
      const filePath = urlParts[1].split('?')[0];

      const { error } = await supabase.storage
        .from('show-submissions')
        .remove([filePath]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "File deleted",
        description: "Submission audio file has been deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['pending-submissions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete file.",
        variant: "destructive",
      });
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ 
      submissionId, 
      status, 
      reviewerNotes 
    }: { 
      submissionId: string; 
      status: string; 
      reviewerNotes?: string;
    }) => {
      const { error } = await supabase
        .from('show_submissions')
        .update({
          status,
          reviewer_notes: reviewerNotes,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Submission status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['pending-submissions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update status.",
        variant: "destructive",
      });
    }
  });

  const approveSubmission = useMutation({
    mutationFn: async ({ submissionId, reviewerNotes }: { submissionId: string; reviewerNotes?: string }) => {
      const { data, error } = await supabase.rpc('approve_submission_and_create_show', {
        submission_id: submissionId,
        reviewer_notes: reviewerNotes || null
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Submission approved!",
        description: "Show has been created and added to the schedule.",
      });
      queryClient.invalidateQueries({ queryKey: ['pending-submissions'] });
    },
    onError: (error: any) => {
      toast({
        title: "Approval failed",
        description: error.message || "Failed to approve submission.",
        variant: "destructive",
      });
    }
  });

  return {
    trackDownload,
    deleteFile,
    updateStatus,
    approveSubmission
  };
};
