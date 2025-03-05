
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import SponsorsSection from './footer/SponsorsSection';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const [aboutSubtitle, setAboutSubtitle] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
    navigate('/careers');
    toast({
      description: "Career opportunities will be available in the near future. Please check back later!",
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStaffLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/staff/login');
  };

  return (
    <footer className="bg-[#F5F5F5] dark:bg-[#333333] border-t border-[#666666]/20 dark:border-white/10 pb-8 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#FFD700]">About Us</h3>
            <p className="text-gray-700 dark:text-white">
              {aboutSubtitle}
              <Link 
                to="/about" 
                className="ml-1 text-[#E6B800] hover:text-[#CC9900] dark:text-[#FFD700] dark:hover:text-[#FFF3B0] hover:underline inline-block transition-colors"
                onClick={scrollToTop}
              >
                Learn more
              </Link>
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-[#FFD700]">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors">Home</a></li>
              <li><a href="/personalities" className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors">Personalities</a></li>
              <li><a href="/about" className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors">About</a></li>
              <li><a href="/news" className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors">News</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-[#FFD700]">Careers</h3>
            <div className="mt-2">
              <a 
                href="/careers" 
                onClick={handleCareersClick} 
                className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors"
              >
                View opportunities
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-[#FFD700]">Follow Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
            <div>
              <button 
                onClick={handleStaffLogin} 
                className="text-gray-700 hover:text-[#FFD700] dark:text-white dark:hover:text-[#FFD700] transition-colors text-sm"
              >
                Staff Login
              </button>
            </div>
          </div>
        </div>
        
        {/* Sponsors Section - Will only render if sponsors exist */}
        <SponsorsSection />
        
        <div className="mt-12 pt-8 border-t border-[#666666]/20 dark:border-white/10 text-center text-gray-700 dark:text-white">
          <p>&copy; {new Date().getFullYear()} Radio Station. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
