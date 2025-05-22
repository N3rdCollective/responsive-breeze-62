
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DesktopNav from "./navbar/DesktopNav";
import MobileNav from "./navbar/MobileNav";
import AuthModal from "@/components/auth/AuthModal"; // Import AuthModal
import { useAuth } from "@/hooks/useAuth";
import { NavigationItem } from "@/types/profile";
import { toast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // State for modal

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
  const isUserLoggedIn = !!user;

  const handleLogout = async () => {
    try {
      await logout();
      // toast for logout is now handled within useAuth's logout method
      // navigate("/") is also handled by useAuth's logout via window.location.href
    } catch (error) {
      console.error("Logout error from Navbar:", error);
      // Error toast is also handled within useAuth
    }
  };
  
  const handleSignInClick = () => {
    setIsAuthModalOpen(true);
  };

  const navigationItems: NavigationItem[] = [
    { path: "/", label: "Home" },
    { path: "/personalities", label: "Personalities" },
    { path: "/schedule", label: "Schedule" },
    { path: "/about", label: "About" },
    { path: "/news", label: "News" },
    { path: "/contact", label: "Contact" },
  ];

  if (user) {
    navigationItems.push({ path: "/members", label: "Members" });
    navigationItems.push({ path: "/profile", label: "Profile" });
  }
  
  if (!user) {
    // Updated to open modal
    navigationItems.push({ 
      path: "#auth", // Path is not a route, just an identifier
      label: "Sign In / Sign Up", 
      onClick: handleSignInClick 
    });
  } else {
    navigationItems.push({ 
      path: "#logout", 
      label: "Logout",
      onClick: handleLogout
    });
  }

  return (
    <>
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
              isUserLoggedIn={isUserLoggedIn}
            />

            <MobileNav
              navigationItems={navigationItems}
              isActive={isActive}
              isHomePage={isHomePage}
              isScrolled={isScrolled}
              mounted={mounted}
              isUserLoggedIn={isUserLoggedIn}
            />
          </div>
        </div>
      </nav>
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </>
  );
};

export default Navbar;
