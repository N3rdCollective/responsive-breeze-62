import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePendingSubmissions } from "./hooks/usePendingSubmissions";
import { SubmissionReviewCard } from "./SubmissionReviewCard";
import LoadingSpinner from "@/components/staff/LoadingSpinner";

export const SubmissionReviewQueue = () => {
  const { data: submissions, isLoading } = usePendingSubmissions();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Show Submission Review Queue</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve DJ show submissions
        </p>
      </div>

      {submissions && submissions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Pending Submissions</CardTitle>
            <CardDescription>
              All submissions have been reviewed. Check back later for new submissions.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-6">
          {submissions?.map((submission) => (
            <SubmissionReviewCard key={submission.id} submission={submission} />
          ))}
        </div>
      )}
    </div>
  );
};
