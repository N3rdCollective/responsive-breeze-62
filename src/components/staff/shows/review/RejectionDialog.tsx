import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShowSubmission } from "../types";
import { useSubmissionReview } from "./hooks/useSubmissionReview";

interface RejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: ShowSubmission;
}

export const RejectionDialog = ({ open, onOpenChange, submission }: RejectionDialogProps) => {
  const [action, setAction] = useState<'reject' | 'revise'>('reject');
  const [feedback, setFeedback] = useState("");
  const { updateStatus } = useSubmissionReview();

  const handleSubmit = async () => {
    await updateStatus.mutateAsync({
      submissionId: submission.id,
      status: action === 'reject' ? 'rejected' : 'needs_revision',
      reviewerNotes: feedback
    });
    onOpenChange(false);
    setFeedback("");
    setAction('reject');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Provide Feedback</DialogTitle>
          <DialogDescription>
            Let the DJ know what needs to be changed or why the submission is being rejected
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="action">Action</Label>
            <Select value={action} onValueChange={(v) => setAction(v as 'reject' | 'revise')}>
              <SelectTrigger id="action">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revise">Request Revision</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="feedback">Feedback *</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={action === 'reject' 
                ? "Explain why this submission is being rejected..." 
                : "Describe what needs to be changed..."}
              rows={4}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!feedback.trim() || updateStatus.isPending}
            variant={action === 'reject' ? 'destructive' : 'default'}
          >
            {updateStatus.isPending ? "Submitting..." : action === 'reject' ? "Reject" : "Request Revision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
