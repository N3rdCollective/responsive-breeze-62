import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ShowSubmission } from "../types";
import { useSubmissionReview } from "./hooks/useSubmissionReview";

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: ShowSubmission;
}

export const ApprovalDialog = ({ open, onOpenChange, submission }: ApprovalDialogProps) => {
  const [notes, setNotes] = useState("");
  const { approveSubmission } = useSubmissionReview();

  const handleApprove = async () => {
    await approveSubmission.mutateAsync({
      submissionId: submission.id,
      reviewerNotes: notes
    });
    onOpenChange(false);
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Submission</DialogTitle>
          <DialogDescription>
            This will create a new show in the schedule with the following details:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold">Show Title:</p>
            <p className="text-sm text-muted-foreground">{submission.show_title}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Schedule:</p>
            <p className="text-sm text-muted-foreground">
              {submission.proposed_days.join(', ')} at {submission.proposed_start_time} - {submission.proposed_end_time}
            </p>
          </div>

          <div>
            <Label htmlFor="approval_notes">Notes for DJ (Optional)</Label>
            <Textarea
              id="approval_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes or feedback..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={approveSubmission.isPending}>
            {approveSubmission.isPending ? "Approving..." : "Approve & Create Show"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
