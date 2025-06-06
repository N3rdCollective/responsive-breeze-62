
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DesktopNav from "./navbar/DesktopNav";
import MobileNav from "./navbar/MobileNav";
import AuthModal from "@/components/auth/AuthModal";
import NotificationBell from "@/components/notifications/NotificationBell";
import ListenButton from "./navbar/ListenButton";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { useUnifiedMessages } from "@/hooks/useUnifiedMessages";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, User, LogOut, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  
  const { user, logout: userLogout } = useAuth();
  const { staffName, handleLogout: staffLogout, userRole: staffUserRole } = useStaffAuth();
  const { totalUnreadCount } = useUnifiedMessages();

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

  const handleLogout = async () => {
    try {
      await userLogout();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

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
            {/* Logo */}
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
            <DesktopNav isScrolled={isScrolled} />

            {/* User Controls */}
            <div className="hidden md:flex items-center space-x-4">
              <ListenButton isScrolled={isScrolled} isHomePage={isHomePage} />
              
              {user ? (
                <>
                  {/* Notifications */}
                  <NotificationBell isHomePage={isHomePage} isScrolled={isScrolled} />
                  
                  {/* Messages - Updated to use unified count */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate("/messages")}
                    className={`relative ${
                      isHomePage && !isScrolled 
                        ? "text-white hover:text-primary dark:text-primary dark:hover:text-white hover:bg-white/10 dark:hover:bg-black/10" 
                        : "text-foreground hover:text-primary dark:hover:text-primary hover:bg-accent dark:hover:bg-accent"
                    }`}
                  >
                    <Mail className="h-5 w-5" />
                    {totalUnreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 min-w-[1rem] p-0 flex items-center justify-center text-xs rounded-full"
                      >
                        {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                      </Badge>
                    )}
                  </Button>

                  {/* User Avatar Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={user.email || "User"} />
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button onClick={handleAuthModalOpen} variant="outline">
                  Sign In
                </Button>
              )}
            </div>

            {/* Mobile Navigation - Pass the auth modal handler */}
            <MobileNav 
              isScrolled={isScrolled} 
              isHomePage={isHomePage} 
              onAuthModalOpen={handleAuthModalOpen}
            />
          </div>
        </div>
      </nav>
      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </>
  );
};

export default Navbar;
