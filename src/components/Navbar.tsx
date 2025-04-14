
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import DesktopNav from "./navbar/DesktopNav";
import MobileNav from "./navbar/MobileNav";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, User, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { Profile } from "@/types/supabase";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    // Check if the user is logged in
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      
      if (data.session) {
        // Get user's role if available
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
          
        if (profileData) {
          setUserRole((profileData as Profile).role);
        }
      }
    };
    
    checkAuth();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoggedIn(!!session);
        
        if (session) {
          // Get user's role if available
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          if (profileData) {
            setUserRole((profileData as Profile).role);
          }
        } else {
          setUserRole(null);
        }
      }
    );
    
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const isHomePage = location.pathname === "/";

  const navigationItems = [
    { path: "/", label: "Home" },
    { path: "/personalities", label: "Personalities" },
    { path: "/schedule", label: "Schedule" },
    { path: "/about", label: "About" },
    { path: "/news", label: "News" },
    { path: "/contact", label: "Contact" },
  ];
  
  // Add messages link if user is logged in
  if (isLoggedIn) {
    navigationItems.push({ path: "/messages", label: "Messages" });
  }

  // Add staff portal link if user is logged in as staff
  if (isLoggedIn && userRole === "staff") {
    navigationItems.push({ path: "/staff/panel", label: "Staff Portal" });
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-white/90 dark:bg-[#333333]/90 backdrop-blur-md shadow-sm" 
        : isHomePage 
          ? "bg-transparent" 
          : "bg-white dark:bg-[#333333]"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className={`text-xl font-bold ${
              isHomePage && !isScrolled 
                ? "text-white dark:text-[#FFD700]" 
                : "text-[#333333] dark:text-[#FFD700] bg-clip-text"
            }`}>
              Rappin' Lounge
            </Link>
          </div>

          {/* Desktop Navigation */}
          <DesktopNav 
            navigationItems={navigationItems}
            isActive={isActive}
            isHomePage={isHomePage}
            isScrolled={isScrolled}
            mounted={mounted}
          />

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2 ml-4">
            {isLoggedIn ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center gap-1 ${
                  isHomePage && !isScrolled
                    ? "text-white hover:text-white/90 hover:bg-white/10"
                    : "text-primary hover:text-primary/90"
                }`}
                asChild
              >
                <Link to="/profile">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </Button>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`${
                    isHomePage && !isScrolled
                      ? "text-white hover:text-white/90 hover:bg-white/10"
                      : "text-primary hover:text-primary/90"
                  }`}
                  asChild
                >
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-1" />
                    Log In
                  </Link>
                </Button>
                <Button 
                  size="sm" 
                  className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-black"
                  asChild
                >
                  <Link to="/signup">
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <MobileNav
            navigationItems={navigationItems}
            isActive={isActive}
            isHomePage={isHomePage}
            isScrolled={isScrolled}
            mounted={mounted}
            isLoggedIn={isLoggedIn}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
