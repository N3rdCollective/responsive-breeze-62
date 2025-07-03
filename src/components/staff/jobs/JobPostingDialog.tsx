import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  employment_type: string;
  department?: string;
  salary_range?: string;
  application_deadline?: string;
  is_active: boolean;
}

interface JobPostingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: JobPosting | null;
  onSuccess: () => void;
}

const JobPostingDialog = ({ open, onOpenChange, job, onSuccess }: JobPostingDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    employment_type: "full-time",
    department: "",
    salary_range: "",
    application_deadline: "",
    is_active: true
  });

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || "",
        description: job.description || "",
        requirements: job.requirements || "",
        location: job.location || "",
        employment_type: job.employment_type || "full-time",
        department: job.department || "",
        salary_range: job.salary_range || "",
        application_deadline: job.application_deadline ? 
          new Date(job.application_deadline).toISOString().split('T')[0] : "",
        is_active: job.is_active
      });
    } else {
      setFormData({
        title: "",
        description: "",
        requirements: "",
        location: "",
        employment_type: "full-time",
        department: "",
        salary_range: "",
        application_deadline: "",
        is_active: true
      });
    }
  }, [job, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      const jobData = {
        ...formData,
        application_deadline: formData.application_deadline || null,
        created_by: user.id
      };

      if (job) {
        const { error } = await supabase
          .from('job_postings')
          .update(jobData)
          .eq('id', job.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Job posting updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('job_postings')
          .insert([jobData]);

        if (error) throw error;

        toast({
          title: "Success", 
          description: "Job posting created successfully"
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save job posting",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? "Edit Job Posting" : "Create New Job Posting"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employment_type">Employment Type</Label>
              <Select 
                value={formData.employment_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, employment_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="e.g. Broadcasting, Marketing"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Remote, New York, NY"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary_range">Salary Range</Label>
              <Input
                id="salary_range"
                value={formData.salary_range}
                onChange={(e) => setFormData(prev => ({ ...prev, salary_range: e.target.value }))}
                placeholder="e.g. $50,000 - $70,000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="application_deadline">Application Deadline</Label>
              <Input
                id="application_deadline"
                type="date"
                value={formData.application_deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, application_deadline: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              className="min-h-[100px]"
              placeholder="List the qualifications and requirements for this position"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active (visible to job seekers)</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : job ? "Update" : "Create"} Job Posting
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JobPostingDialog;