
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import SponsorsSection from './footer/SponsorsSection';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast"; // Corrected import path
import { useAuth } from "@/hooks/useAuth";

const Footer = () => {
  const [aboutSubtitle, setAboutSubtitle] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const { data, error } = await supabase
          .from("about_page")
          .select("subtitle")
          .single();

        if (error) {
          console.error("Error fetching about subtitle:", error);
          // Fallback to default text if there's an error
          setAboutSubtitle("Founded by the visionary DJ Epidemik, Rappin' Lounge Radio offers a unique listening experience, blending the heart of hip-hop with a vibrant mix of genres that reflect the diversity of our global community.");
          return;
        }

        if (data && data.subtitle) {
          setAboutSubtitle(data.subtitle);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    fetchAboutContent();
  }, []);

  const handleCareersClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    navigate('/careers');
    toast({
      description: "Career opportunities will be available in the near future. Please check back later!",
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDashboardNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    navigate('/staff/panel');
  };

  const handleNavigation = (path: string) => {
    window.scrollTo(0, 0);
    // Removed navigate(path) as it was likely unintentional for simple scroll-to-top links
  };

  return (
    <footer className="bg-hot97-black border-t border-hot97-purple/50 text-hot97-white pb-8 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold hot97-text-gradient">About Us</h3>
            <p className="text-hot97-light-pink">
              {aboutSubtitle}
              <Link 
                to="/about" 
                className="ml-1 text-hot97-pink hover:text-hot97-magenta hover:underline inline-block transition-colors"
                onClick={scrollToTop}
              >
                Learn more
              </Link>
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 hot97-text-gradient">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" onClick={() => handleNavigation('/')} className="text-hot97-light-pink hover:text-hot97-pink transition-colors">Home</Link></li>
              <li><Link to="/personalities" onClick={() => handleNavigation('/personalities')} className="text-hot97-light-pink hover:text-hot97-pink transition-colors">Personalities</Link></li>
              <li><Link to="/about" onClick={() => handleNavigation('/about')} className="text-hot97-light-pink hover:text-hot97-pink transition-colors">About</Link></li>
              <li><Link to="/news" onClick={() => handleNavigation('/news')} className="text-hot97-light-pink hover:text-hot97-pink transition-colors">News</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 hot97-text-gradient">Careers</h3>
            <div className="mt-2">
              <a 
                href="/careers" 
                onClick={handleCareersClick} 
                className="text-hot97-light-pink hover:text-hot97-pink transition-colors"
              >
                View opportunities
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 hot97-text-gradient">Follow Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-hot97-light-pink hover:text-hot97-pink transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-hot97-light-pink hover:text-hot97-pink transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-hot97-light-pink hover:text-hot97-pink transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-hot97-light-pink hover:text-hot97-pink transition-colors">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
            <div>
              {!authLoading && user && (
                <button 
                  onClick={handleDashboardNavigation} 
                  className="text-hot97-light-pink hover:text-hot97-pink transition-colors text-sm"
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
        
        <SponsorsSection />
        
        <div className="mt-12 pt-8 border-t border-hot97-purple/50 text-center text-hot97-light-pink">
          <p>&copy; {new Date().getFullYear()} HOT 97. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
