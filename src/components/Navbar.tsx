
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DesktopNav from "./navbar/DesktopNav";
import MobileNav from "./navbar/MobileNav";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { toast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  
  const { user, logout: userLogout } = useAuth();
  const { staffName, handleLogout: staffLogout, userRole: staffUserRole } = useStaffAuth();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); 

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
  
  const handleAuthModalOpen = () => {
    setIsAuthModalOpen(true);
  };

  // This prop is for features like NotificationBell that are specific to general user accounts
  const isGeneralUserLoggedIn = !!user;

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

            <DesktopNav />

            <MobileNav />
          </div>
        </div>
      </nav>
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </>
  );
};

export default Navbar;
