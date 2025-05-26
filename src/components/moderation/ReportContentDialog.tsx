
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useContentReports, NewContentReportPayload } from '@/hooks/moderation/useContentReports'; // Adjusted import path
import { AlertTriangle } from 'lucide-react';

interface ReportContentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'post' | 'topic';
  contentId: string;
  reportedUserId: string;
  contentPreview?: string;
  topicId?: string;
}

const ReportContentDialog: React.FC<ReportContentDialogProps> = ({
  isOpen,
  onOpenChange,
  contentType,
  contentId,
  reportedUserId,
  contentPreview,
  topicId,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createContentReport } = useContentReports();

  const handleSubmitReport = async () => {
    if (!reason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for your report.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const payload: NewContentReportPayload = {
      contentType,
      contentId,
      reportedUserId,
      reportReason: reason,
      contentPreview,
      topicId,
    };

    const success = await createContentReport(payload);
    if (success) {
      setReason(''); // Clear reason for next time
      onOpenChange(false); // Close dialog
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500" />
            Report Content
          </DialogTitle>
          <DialogDescription>
            Please provide details about why you are reporting this {contentType}. 
            Your report will be reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="report-reason" className="text-right">
              Reason
            </Label>
            <Textarea
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="col-span-3 min-h-[100px]"
              placeholder={`Explain why this ${contentType} is being reported...`}
            />
          </div>
          {contentPreview && (
            <div className="col-span-4">
              <Label className="text-sm font-medium">Content Preview:</Label>
              <p className="mt-1 text-sm text-muted-foreground bg-muted p-2 rounded-md max-h-20 overflow-y-auto">
                {contentPreview}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmitReport} disabled={isSubmitting || !reason.trim()}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportContentDialog;
