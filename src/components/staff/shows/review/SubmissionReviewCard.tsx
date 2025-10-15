import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar, Clock, Download, Trash2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { ShowSubmission } from "../types";
import { SubmissionStatusBadge } from "../submissions/SubmissionStatusBadge";
import { useSubmissionReview } from "./hooks/useSubmissionReview";
import { supabase } from "@/integrations/supabase/client";
import { ApprovalDialog } from "./ApprovalDialog";
import { RejectionDialog } from "./RejectionDialog";

interface SubmissionReviewCardProps {
  submission: ShowSubmission;
}

export const SubmissionReviewCard = ({ submission }: SubmissionReviewCardProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const { trackDownload, deleteFile } = useSubmissionReview();

  const handleDownload = async () => {
    try {
      // Extract file path from URL
      const urlParts = submission.audio_file_url.split('/show-submissions/');
      if (urlParts.length < 2) throw new Error('Invalid file URL');
      
      const filePath = urlParts[1].split('?')[0];

      // Download from storage
      const { data, error } = await supabase.storage
        .from('show-submissions')
        .download(filePath);

      if (error) throw error;

      // Track download
      await trackDownload.mutateAsync(submission.id);

      // Trigger browser download
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${submission.show_title}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDelete = async () => {
    await deleteFile.mutateAsync({
      submissionId: submission.id,
      audioUrl: submission.audio_file_url
    });
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle>{submission.show_title}</CardTitle>
              {submission.episode_title && (
                <p className="text-sm text-muted-foreground mt-1">
                  Episode: {submission.episode_title}
                </p>
              )}
            </div>
            <SubmissionStatusBadge status={submission.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {submission.show_description && (
            <p className="text-sm">{submission.show_description}</p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{submission.proposed_days.join(', ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{submission.proposed_start_time} - {submission.proposed_end_time}</span>
            </div>
          </div>

          {submission.submission_notes && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-semibold mb-1">DJ Notes:</p>
              <p className="text-sm">{submission.submission_notes}</p>
            </div>
          )}

          {/* Audio Player */}
          <div className="bg-muted p-4 rounded-md">
            <audio controls className="w-full">
              <source src={submission.audio_file_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>

          {/* Download Status */}
          {submission.downloaded_at && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Downloaded on {new Date(submission.downloaded_at).toLocaleDateString()}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            
            <Button
              onClick={() => setShowDeleteDialog(true)}
              variant="outline"
              size="sm"
              disabled={!submission.downloaded_at}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete File
            </Button>

            <div className="flex-1" />

            <Button
              onClick={() => setShowRejectionDialog(true)}
              variant="outline"
              size="sm"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>

            <Button
              onClick={() => setShowRejectionDialog(true)}
              variant="outline"
              size="sm"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Request Revision
            </Button>

            <Button
              onClick={() => setShowApprovalDialog(true)}
              size="sm"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission File?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the audio file from storage.
              Make sure you've downloaded it first.
              <br /><br />
              <strong>Downloaded:</strong> {submission.downloaded_at ? '✓ Yes' : '✗ No'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete File
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approval Dialog */}
      <ApprovalDialog
        open={showApprovalDialog}
        onOpenChange={setShowApprovalDialog}
        submission={submission}
      />

      {/* Rejection Dialog */}
      <RejectionDialog
        open={showRejectionDialog}
        onOpenChange={setShowRejectionDialog}
        submission={submission}
      />
    </>
  );
};
