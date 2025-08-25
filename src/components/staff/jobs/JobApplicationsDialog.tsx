import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Download, Mail, Phone, Eye, FileText, Shield } from "lucide-react";
import { useHRPermissions } from "@/hooks/staff/useHRPermissions";

interface JobPosting {
  id: string;
  title: string;
}

interface JobApplication {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resume_filename?: string;
  resume_url?: string;
  cover_letter: string;
  application_status: string;
  applied_at: string;
  reviewed_at?: string;
  notes?: string;
}

interface JobApplicationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: JobPosting | null;
  onSuccess: () => void;
}

const JobApplicationsDialog = ({ open, onOpenChange, job, onSuccess }: JobApplicationsDialogProps) => {
  const { toast } = useToast();
  const { hasHRAccess, isLoading: hrLoading } = useHRPermissions();
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [notes, setNotes] = useState("");

  const { data: applications = [], isLoading, refetch } = useQuery({
    queryKey: ['job-applications', job?.id],
    queryFn: async () => {
      if (!job?.id) return [];
      
      // Use the secure function to get HR job applications
      const { data, error } = await supabase.rpc('get_job_applications_for_hr');

      if (error) throw error;
      
      // Filter by job posting ID if specified
      const filteredData = job?.id 
        ? (data || []).filter(app => app.job_posting_id === job.id)
        : (data || []);
        
      return filteredData;
    },
    enabled: !!job?.id && open && hasHRAccess
  });

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    const { error } = await supabase
      .from('job_applications')
      .update({ 
        application_status: status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        notes: notes || undefined
      })
      .eq('id', applicationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "Application status updated successfully"
    });
    
    refetch();
    setSelectedApplication(null);
    setNotes("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'reviewed': return 'default';
      case 'rejected': return 'destructive';
      case 'hired': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'reviewed': return 'outline';
      case 'rejected': return 'destructive';
      case 'hired': return 'default';
      default: return 'secondary';
    }
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Applications for {job.title}</DialogTitle>
        </DialogHeader>

        {hrLoading || isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !hasHRAccess ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">HR Access Required</h3>
            <p className="text-muted-foreground max-w-md">
              You need HR permissions to view job applications containing sensitive personal information. 
              Please contact a super admin to request HR access.
            </p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No applications received yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{application.name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {application.email}
                        </div>
                        {application.phone && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {application.phone}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(application.application_status)}>
                        {application.application_status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(application.applied_at))} ago
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Cover Letter</Label>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                      {application.cover_letter}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {application.resume_filename && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          {application.resume_filename}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {application.resume_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(application.resume_url, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedApplication(application);
                          setNotes(application.notes || "");
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review Application Dialog */}
        {selectedApplication && (
          <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Review Application - {selectedApplication.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Cover Letter</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                    {selectedApplication.cover_letter}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="status">Application Status</Label>
                  <Select defaultValue={selectedApplication.application_status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Internal)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add internal notes about this application..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedApplication(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'reviewed')}
                  >
                    Mark Reviewed
                  </Button>
                  <Button 
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'hired')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Hire
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationsDialog;