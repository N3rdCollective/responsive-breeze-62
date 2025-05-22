
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast"; // Corrected import path
import { useState } from "react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast(); // Uses the corrected import

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submitted:", { name, email, message });
    
    toast({
      title: "Message sent!",
      description: "Thanks for reaching out. We'll get back to you soon.",
      className: "bg-hot97-magenta text-hot97-white border-hot97-pink", 
    });

    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-hot97-black text-hot97-white">
      <Navbar /> {/* Navbar will be themed */}
      <div className="max-w-2xl mx-auto px-4 pt-24 pb-16"> {/* pt-24 to account for fixed Navbar height */}
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl hot97-text-gradient">Contact Us</h1>
            <p className="text-hot97-light-pink">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8 rounded-lg shadow-2xl bg-hot97-dark-purple/50 border border-hot97-magenta/50">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-hot97-pink">
                Name
              </label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-hot97-black/50 border-hot97-magenta text-hot97-white placeholder-hot97-light-pink/70 focus:border-hot97-pink focus:ring-hot97-pink"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-hot97-pink">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-hot97-black/50 border-hot97-magenta text-hot97-white placeholder-hot97-light-pink/70 focus:border-hot97-pink focus:ring-hot97-pink"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-hot97-pink">
                Message
              </label>
              <Textarea
                id="message"
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[150px] bg-hot97-black/50 border-hot97-magenta text-hot97-white placeholder-hot97-light-pink/70 focus:border-hot97-pink focus:ring-hot97-pink"
                required
              />
            </div>
            <Button type="submit" className="w-full hot97-primary-bg hover:opacity-90 transition-opacity text-lg py-3">
              Send Message
            </Button>
          </form>
        </div>
      </div>
      <div className="mb-20"> {/* Added back to ensure Footer spacing if it's indeed separate */}
        <Footer /> {/* Footer will be themed */}
      </div>
    </div>
  );
};

export default Contact;
