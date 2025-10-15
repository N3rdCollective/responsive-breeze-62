import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Music } from "lucide-react";
import { ShowSubmission } from "../types";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";
import { format } from "date-fns";

interface SubmissionCardProps {
  submission: ShowSubmission;
}

export const SubmissionCard = ({ submission }: SubmissionCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
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
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            <span>Submitted {format(new Date(submission.submitted_at), 'MMM d, yyyy')}</span>
          </div>
        </div>

        {submission.reviewer_notes && (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-semibold mb-1">Program Director Feedback:</p>
            <p className="text-sm">{submission.reviewer_notes}</p>
          </div>
        )}

        {submission.submission_notes && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm font-semibold mb-1">Your Notes:</p>
            <p className="text-sm">{submission.submission_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
