import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building, 
  Users, 
  Loader2,
  Calendar,
  Briefcase
} from "lucide-react";
import TitleUpdater from "@/components/TitleUpdater";

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
}

const JobPostingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: jobPosting, isLoading } = useQuery({
    queryKey: ['job-posting', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as JobPosting;
    },
    enabled: !!id
  });

  const validateForm = () => {
    if (!name || !email || !coverLetter || !resume) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return false;
    }

    if (resume && resume.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Resume must be less than 5MB in size",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !jobPosting) return;
    
    setIsSubmitting(true);
    
    try {
      const reader = new FileReader();
      const resumeDataPromise = new Promise<string | null>((resolve) => {
        reader.onload = (e) => {
          if (e.target?.result) {
            const base64Data = e.target.result.toString().split(',')[1];
            resolve(base64Data);
          } else {
            resolve(null);
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(resume!);
      });
      
      const resumeData = await resumeDataPromise;
      if (!resumeData) {
        throw new Error("Failed to process the resume file");
      }
      
      const { data, error } = await supabase.functions.invoke('send-career-application', {
        body: {
          name,
          email,
          phone,
          position: jobPosting.title,
          coverLetter,
          resumeData,
          resumeFileName: resume!.name,
          jobPostingId: jobPosting.id
        }
      });
      
      if (error || (data && data.error)) {
        throw new Error(data?.error || error.message || "Application submission failed");
      }
      
      toast({
        title: "Application submitted!",
        description: "Thanks for your interest. We'll review your application and get back to you soon.",
      });
      
      // Clear form
      setName("");
      setEmail("");
      setPhone("");
      setCoverLetter("");
      setResume(null);
      
      const fileInput = document.getElementById('resume') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      toast({
        title: "Submission failed",
        description: error.message || "There was an error submitting your application. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!jobPosting) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Job Not Found</h1>
          <p className="text-muted-foreground mb-6">This job posting is no longer available.</p>
          <Button onClick={() => navigate('/careers')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Careers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <TitleUpdater title={`${jobPosting.title} - Careers`} />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/careers')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Jobs
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Job Details - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{jobPosting.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {jobPosting.department && (
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {jobPosting.department}
                      </div>
                    )}
                    {jobPosting.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {jobPosting.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {jobPosting.employment_type}
                    </div>
                  </div>
                </div>
                <Badge variant="default" className="text-sm">
                  Active
                </Badge>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground border border-border rounded-lg p-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Posted {formatDistanceToNow(new Date(jobPosting.posted_date))} ago
                </div>
                {jobPosting.salary_range && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {jobPosting.salary_range}
                  </div>
                )}
                {jobPosting.application_deadline && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Deadline: {new Date(jobPosting.application_deadline).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">About This Role</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {jobPosting.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {jobPosting.requirements && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Requirements</h2>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    {jobPosting.requirements.split('\n').map((line, index) => (
                      <p key={index} className="mb-2">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Application Form - Right Column */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Apply for this Position
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resume">Resume/CV *</Label>
                    <Input
                      id="resume"
                      type="file"
                      onChange={(e) => setResume(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx"
                      required
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (max 5MB)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Cover Letter *</Label>
                    <Textarea
                      id="coverLetter"
                      placeholder="Tell us why you'd be a great fit..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="min-h-[120px]"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobPostingDetail;