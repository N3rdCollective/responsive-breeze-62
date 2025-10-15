import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMySubmissions } from "./hooks/useMySubmissions";
import { SubmissionCard } from "./SubmissionCard";
import LoadingSpinner from "@/components/staff/LoadingSpinner";

export const MySubmissions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: submissions, isLoading } = useMySubmissions(user?.id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Show Submissions</h1>
          <p className="text-muted-foreground mt-1">
            Track your submitted shows and their review status
          </p>
        </div>
        <Button onClick={() => navigate('/staff/shows/submit')}>
          <Plus className="w-4 h-4 mr-2" />
          Submit New Show
        </Button>
      </div>

      {submissions && submissions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Submissions Yet</CardTitle>
            <CardDescription>
              You haven't submitted any shows for review. Click the button above to submit your first show!
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {submissions?.map((submission) => (
            <SubmissionCard key={submission.id} submission={submission} />
          ))}
        </div>
      )}
    </div>
  );
};
