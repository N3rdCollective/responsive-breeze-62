import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Eye, Edit, Trash2, Users, Clock, MapPin, DollarSign } from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import JobPostingDialog from "@/components/staff/jobs/JobPostingDialog";
import JobApplicationsDialog from "@/components/staff/jobs/JobApplicationsDialog";

interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  employment_type: string;
  department?: string;
  salary_range?: string;
  posted_date: string;
  application_deadline?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  application_count?: number;
}

const StaffJobsPage = () => {
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showApplicationsDialog, setShowApplicationsDialog] = useState(false);
  const { toast } = useToast();

  const { data: jobPostings = [], isLoading, refetch } = useQuery({
    queryKey: ['staff-job-postings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select(`
          *,
          application_count:job_applications(count)
        `)
        .order('posted_date', { ascending: false });

      if (error) throw error;
      return data.map(job => ({
        ...job,
        application_count: job.application_count?.[0]?.count || 0
      }));
    }
  });

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    const { error } = await supabase
      .from('job_postings')
      .delete()
      .eq('id', jobId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete job posting",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Job posting deleted successfully"
    });
    refetch();
  };

  const handleToggleActive = async (job: JobPosting) => {
    const { error } = await supabase
      .from('job_postings')
      .update({ is_active: !job.is_active })
      .eq('id', job.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: `Job posting ${!job.is_active ? 'activated' : 'deactivated'} successfully`
    });
    refetch();
  };

  const activeJobs = jobPostings.filter(job => job.is_active);
  const inactiveJobs = jobPostings.filter(job => !job.is_active);

  const JobCard = ({ job }: { job: JobPosting }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              {job.department && <span>{job.department}</span>}
              {job.location && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </div>
                </>
              )}
            </div>
          </div>
          <Badge variant={job.is_active ? "default" : "secondary"}>
            {job.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Posted {formatDistanceToNow(new Date(job.posted_date))} ago
          </div>
          {job.salary_range && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {job.salary_range}
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-sm">
            <Users className="h-4 w-4" />
            {job.application_count} applications
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedJob(job);
                setShowApplicationsDialog(true);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              Applications
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedJob(job);
                setShowJobDialog(true);
              }}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleActive(job)}
            >
              {job.is_active ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteJob(job.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <TitleUpdater title="Job Management - Staff Panel" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Job Management</h1>
            <p className="text-muted-foreground">Manage job postings and applications</p>
          </div>
          <Button onClick={() => {
            setSelectedJob(null);
            setShowJobDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            New Job Posting
          </Button>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Jobs ({activeJobs.length})</TabsTrigger>
            <TabsTrigger value="inactive">Inactive Jobs ({inactiveJobs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No active job postings</p>
                </CardContent>
              </Card>
            ) : (
              activeJobs.map(job => <JobCard key={job.id} job={job} />)
            )}
          </TabsContent>

          <TabsContent value="inactive" className="space-y-4">
            {inactiveJobs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No inactive job postings</p>
                </CardContent>
              </Card>
            ) : (
              inactiveJobs.map(job => <JobCard key={job.id} job={job} />)
            )}
          </TabsContent>
        </Tabs>
      </div>

      <JobPostingDialog
        open={showJobDialog}
        onOpenChange={setShowJobDialog}
        job={selectedJob}
        onSuccess={() => {
          refetch();
          setShowJobDialog(false);
          setSelectedJob(null);
        }}
      />

      <JobApplicationsDialog
        open={showApplicationsDialog}
        onOpenChange={setShowApplicationsDialog}
        job={selectedJob}
        onSuccess={() => refetch()}
      />
    </>
  );
};

export default StaffJobsPage;