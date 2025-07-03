
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Clock, DollarSign, Building, ArrowRight, Briefcase, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
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

const Careers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: jobPostings = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['active-job-postings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('is_active', true)
        .order('posted_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const handleJobClick = (jobId: string) => {
    navigate(`/careers/${jobId}`);
  };

  return (
    <>
      <TitleUpdater title="Careers - Join Our Team" />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Hero Section */}
        <div className="relative bg-primary/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 pt-24 pb-16">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                <Users className="h-4 w-4 mr-2" />
                We're Hiring
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                Join Our <span className="text-primary">Radio Family</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Be part of a growing radio station that's building the future of community broadcasting. 
                We're looking for passionate individuals to help us create amazing content and connect with our audience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="px-8" onClick={() => {
                  const jobsSection = document.getElementById('open-positions');
                  jobsSection?.scrollIntoView({ behavior: 'smooth' });
                }}>
                  View Open Positions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="px-8">
                  Learn About Our Culture
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Why Join Us Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Work With Us?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover what makes Rappin' Lounge Radio a great place to build your career
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Creative Freedom</h3>
                <p className="text-muted-foreground">
                  Express your creativity and contribute to innovative content that reaches thousands of listeners daily.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Growth Opportunities</h3>
                <p className="text-muted-foreground">
                  Grow with us as we expand. Early team members have unique opportunities for career advancement.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Competitive Compensation</h3>
                <p className="text-muted-foreground">
                  We offer competitive packages including revenue sharing and equity opportunities for key positions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Current Job Openings */}
        <div id="open-positions" className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Current Openings</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find your perfect role and start building the future of radio with us
            </p>
          </div>

          {jobsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : jobPostings.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {jobPostings.map((job: JobPosting) => (
                <Card 
                  key={job.id} 
                  className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
                  onClick={() => handleJobClick(job.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {job.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {job.department && (
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {job.department}
                            </div>
                          )}
                          {job.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {job.employment_type}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0">
                        {job.employment_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                      {job.description.split('\n')[0]}
                    </p>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(job.posted_date))} ago
                        </div>
                        {job.salary_range && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {job.salary_range}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        Apply Now
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>

                    {job.application_deadline && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Application deadline: {new Date(job.application_deadline).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Briefcase className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Open Positions</h3>
                    <p className="text-muted-foreground mb-6">
                      We don't have any open positions at the moment, but we're always interested in hearing from talented individuals.
                    </p>
                    <Button variant="outline">
                      Get Notified About Future Openings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Section */}
        <div className="bg-card border-t">
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Don't See a Perfect Fit?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're always looking for talented people to join our team. Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <Button size="lg" variant="outline">
              Send Us Your Resume
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Careers;
