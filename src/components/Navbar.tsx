import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import DesktopNav from "./navbar/DesktopNav";
import MobileNav from "./navbar/MobileNav";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";
import { Profile } from "@/types/supabase";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      
      if (data.session) {
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
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsLoggedIn(!!session);
        
        if (session) {
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
  
  if (!isLoggedIn) {
    navigationItems.push(
      { path: "/login", label: "Log In" },
      { path: "/signup", label: "Sign Up" }
    );
  }

  if (isLoggedIn) {
    navigationItems.push({ path: "/messages", label: "Messages" });
  }

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

          <DesktopNav 
            navigationItems={navigationItems}
            isActive={isActive}
            isHomePage={isHomePage}
            isScrolled={isScrolled}
            mounted={mounted}
          />

          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn && (
              <Link 
                to="/profile"
                className={`flex items-center gap-1 hover:underline ${
                  isHomePage && !isScrolled
                    ? "text-white hover:text-white/90"
                    : "text-primary hover:text-primary/90"
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            )}
          </div>

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
