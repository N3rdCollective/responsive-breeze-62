
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const Careers = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [position, setPosition] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically send the form data to your backend
    console.log("Application submitted:", { name, email, position, coverLetter, resume });
    
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
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <div className="space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Join Our Team</h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We're always looking for talented individuals to join our radio family. 
              Whether you're a seasoned broadcaster or just starting out, we'd love to hear from you.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Why Join Us?</h2>
              <ul className="space-y-2 text-gray-600">
                <li>• Creative and dynamic work environment</li>
                <li>• Opportunity to reach millions of listeners</li>
                <li>• State-of-the-art broadcasting equipment</li>
                <li>• Professional development opportunities</li>
                <li>• Competitive benefits package</li>
                <li>• Collaborative team culture</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
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
                  />
                  <p className="text-xs text-gray-500">Accepted formats: PDF, DOC, DOCX</p>
                </div>

                <Button type="submit" className="w-full">
                  Submit Application
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
