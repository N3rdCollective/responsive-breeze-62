
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import DesktopNav from "./navbar/DesktopNav";
import MobileNav from "./navbar/MobileNav";
import { useAuth } from "@/hooks/useAuth";
import { NavigationItem } from "@/types/profile";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
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

  const navigationItems: NavigationItem[] = [
    { path: "/", label: "Home" },
    { path: "/personalities", label: "Personalities" },
    { path: "/schedule", label: "Schedule" },
    { path: "/about", label: "About" },
    { path: "/news", label: "News" },
    { path: "/contact", label: "Contact" },
  ];

  // Add staff portal link if user is logged in
  if (user) {
    // Check if user is staff (this would require a way to check user roles)
    // For now, we'll just add the auth-related links
    navigationItems.push({ path: "/profile", label: "Profile" });
  }
  
  // Add auth link if user is not logged in
  if (!user) {
    navigationItems.push({ path: "/auth", label: "Sign In" });
  } else {
    // Add logout option for logged in users
    navigationItems.push({ 
      path: "#", 
      label: "Logout",
      onClick: () => {
        logout();
        window.location.href = "/";
      }
    });
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

          {/* Mobile Navigation */}
          <MobileNav
            navigationItems={navigationItems}
            isActive={isActive}
            isHomePage={isHomePage}
            isScrolled={isScrolled}
            mounted={mounted}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
