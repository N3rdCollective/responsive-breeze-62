
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Careers = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [position, setPosition] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const validateForm = () => {
    if (!name) {
      toast({
        title: "Missing information",
        description: "Please enter your name",
        variant: "destructive"
      });
      return false;
    }
    
    if (!email) {
      toast({
        title: "Missing information",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return false;
    }
    
    if (!position) {
      toast({
        title: "Missing information",
        description: "Please enter the position you're applying for",
        variant: "destructive"
      });
      return false;
    }
    
    if (!coverLetter) {
      toast({
        title: "Missing information",
        description: "Please provide a cover letter",
        variant: "destructive"
      });
      return false;
    }
    
    if (!resume) {
      toast({
        title: "Missing information",
        description: "Please upload your resume",
        variant: "destructive"
      });
      return false;
    }
    
    // Check file size - limit to 5MB
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
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert resume file to base64
      const reader = new FileReader();
      const resumeDataPromise = new Promise<string | null>((resolve) => {
        reader.onload = (e) => {
          if (e.target?.result) {
            // Get the base64 data without the prefix
            const base64Data = e.target.result.toString().split(',')[1];
            resolve(base64Data);
          } else {
            resolve(null);
          }
        };
        reader.onerror = () => {
          console.error("Error reading file");
          resolve(null);
        };
        reader.readAsDataURL(resume);
      });
      
      const resumeData = await resumeDataPromise;
      if (!resumeData) {
        throw new Error("Failed to process the resume file");
      }
      
      const resumeFileName = resume.name;
      
      console.log("Submitting application with resume:", resumeFileName);
      
      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke('send-career-application', {
        body: {
          name,
          email,
          position,
          coverLetter,
          resumeData,
          resumeFileName
        }
      });
      
      if (error) {
        console.error("Function error:", error);
        throw new Error(error.message || "Application submission failed");
      }
      
      if (!data || data.error) {
        console.error("Data error:", data?.error);
        throw new Error(data?.error || "Unknown error occurred");
      }
      
      // Show success message
      toast({
        title: "Application received!",
        description: "Thanks for your interest. We'll review your application and get back to you soon.",
      });
      
      // Clear form
      setName("");
      setEmail("");
      setPosition("");
      setCoverLetter("");
      setResume(null);
      
      // Reset file input
      const fileInput = document.getElementById('resume') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error: any) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission failed",
        description: error.message || "There was an error submitting your application. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-foreground">Join Our Team</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're always looking for talented individuals to join our radio family. 
              Whether you're a seasoned broadcaster or just starting out, we'd love to hear from you.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Why Join Us?</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Creative and dynamic work environment</li>
                <li>• Opportunity to reach millions of listeners</li>
                <li>• State-of-the-art broadcasting equipment</li>
                <li>• Professional development opportunities</li>
                <li>• Competitive benefits package</li>
                <li>• Collaborative team culture</li>
              </ul>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
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
                  <Label htmlFor="email">Email</Label>
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
                  <Label htmlFor="position">Position of Interest</Label>
                  <Input
                    id="position"
                    placeholder="What position are you applying for?"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Cover Letter</Label>
                  <Textarea
                    id="coverLetter"
                    placeholder="Tell us why you'd be a great fit..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="min-h-[150px]"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resume">Resume/CV</Label>
                  <Input
                    id="resume"
                    type="file"
                    onChange={(e) => setResume(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground">Accepted formats: PDF, DOC, DOCX (max 5MB)</p>
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
            </div>
          </div>
        </div>
      </div>
      <div className="mb-20">
        <Footer />
      </div>
    </div>
  );
};

export default Careers;
