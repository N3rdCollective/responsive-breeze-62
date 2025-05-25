
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DesktopNav from "./navbar/DesktopNav";
import MobileNav from "./navbar/MobileNav";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAuth } from "@/hooks/useStaffAuth"; // Import useStaffAuth
import { NavigationItem } from "@/types/profile";
import { toast } from "@/hooks/use-toast";
// Shield icon is not directly used here but passed to DesktopNav/MobileNav or used in their props

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  
  const { user, logout: userLogout } = useAuth();
  const { staffName, handleLogout: staffLogout, userRole: staffUserRole } = useStaffAuth(); // Get staff auth state

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
  
  // This handleLogout is for the general user, staff logout is separate
  // const handleLogout = async () => { // This specific name is shadowed by staffLogout if not careful
  //   try {
  //     await userLogout();
  //   } catch (error) {
  //     console.error("Logout error from Navbar:", error);
  //   }
  // };
  
  const handleAuthModalOpen = () => {
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

  // Add links based on general user state (if not staff)
  if (user && !staffName) {
    navigationItems.push({ path: "/members", label: "Members" });
    navigationItems.push({ path: "/profile", label: "Profile" });
  }
  
  // Auth links (Sign In / Logout)
  if (staffName) { 
    // If staff is logged in, their primary logout is via staffLogout.
    // No "Sign In / Sign Up" link.
    // "Staff Panel" link will be added directly in DesktopNav/MobileNav.
    navigationItems.push({ 
      path: "#logout-staff", 
      label: "Logout",
      onClick: staffLogout 
    });
  } else if (user) { 
    // Regular user is logged in (and not staff)
    navigationItems.push({ 
      path: "#logout-user", 
      label: "Logout",
      onClick: userLogout
    });
  } else { 
    // No one logged in
    navigationItems.push({ 
      path: "/auth", 
      label: "Sign In / Sign Up"
    });
  }

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

            <DesktopNav 
              navigationItems={navigationItems}
              isActive={isActive}
              isHomePage={isHomePage}
              isScrolled={isScrolled}
              mounted={mounted}
              isUserLoggedIn={isGeneralUserLoggedIn} // For general user features like NotificationBell
              staffName={staffName} // Pass staffName
            />

            <MobileNav
              navigationItems={navigationItems}
              isActive={isActive}
              isHomePage={isHomePage}
              isScrolled={isScrolled}
              mounted={mounted}
              isUserLoggedIn={isGeneralUserLoggedIn} // For general user features like NotificationBell
              staffName={staffName} // Pass staffName
            />
          </div>
        </div>
      </nav>
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </>
  );
};

export default Navbar;

