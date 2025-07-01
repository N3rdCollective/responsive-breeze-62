
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUnifiedMessages } from "@/hooks/useUnifiedMessages";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, Mail, User, LogOut, Settings } from "lucide-react";
import ListenButton from "./ListenButton";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "@/components/notifications/NotificationBell";

interface MobileNavProps {
  isScrolled: boolean;
  isHomePage: boolean;
  onAuthModalOpen: () => void;
}

const MobileNav = ({ isScrolled, isHomePage, onAuthModalOpen }: MobileNavProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout: userLogout, isStaff } = useAuth();
  const { totalUnreadCount } = useUnifiedMessages();

  const handleLogout = async () => {
    try {
      await userLogout();
      setIsOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="md:hidden">
      <div className="flex items-center space-x-2">
        <ListenButton isScrolled={isScrolled} isHomePage={isHomePage} />
        
        {user && (
          <>
            <NotificationBell isHomePage={isHomePage} isScrolled={isScrolled} />
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={`relative transition-colors ${
                isHomePage && !isScrolled 
                  ? "text-white hover:text-primary hover:bg-white/10" 
                  : "text-foreground hover:text-primary hover:bg-accent"
              }`}
            >
              <Link to="/messages">
                <Mail className="h-5 w-5" />
                {totalUnreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-4 w-4 min-w-[1rem] p-0 flex items-center justify-center text-xs rounded-full"
                  >
                    {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                  </Badge>
                )}
              </Link>
            </Button>
          </>
        )}

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className={`transition-colors ${
              isHomePage && !isScrolled 
                ? "text-white hover:text-primary hover:bg-white/10" 
                : "text-foreground hover:text-primary hover:bg-accent"
            }`}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col space-y-2">
              <Link 
                to="/" 
                className="text-lg font-medium px-2 py-3 rounded-md hover:bg-accent transition-colors"
                onClick={handleLinkClick}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="text-lg font-medium px-2 py-3 rounded-md hover:bg-accent transition-colors"
                onClick={handleLinkClick}
              >
                About
              </Link>
              <Link 
                to="/news" 
                className="text-lg font-medium px-2 py-3 rounded-md hover:bg-accent transition-colors"
                onClick={handleLinkClick}
              >
                News
              </Link>
              <Link 
                to="/schedule" 
                className="text-lg font-medium px-2 py-3 rounded-md hover:bg-accent transition-colors"
                onClick={handleLinkClick}
              >
                Schedule
              </Link>
              <Link 
                to="/personalities" 
                className="text-lg font-medium px-2 py-3 rounded-md hover:bg-accent transition-colors"
                onClick={handleLinkClick}
              >
                Personalities
              </Link>
              <Link 
                to="/artists" 
                className="text-lg font-medium px-2 py-3 rounded-md hover:bg-accent transition-colors"
                onClick={handleLinkClick}
              >
                Artists
              </Link>
              <Link 
                to="/members" 
                className="text-lg font-medium px-2 py-3 rounded-md hover:bg-accent transition-colors"
                onClick={handleLinkClick}
              >
                Forum
              </Link>
              <Link 
                to="/chat" 
                className="text-lg font-medium px-2 py-3 rounded-md hover:bg-accent transition-colors"
                onClick={handleLinkClick}
              >
                Chat
              </Link>
              <Link 
                to="/contact" 
                className="text-lg font-medium px-2 py-3 rounded-md hover:bg-accent transition-colors"
                onClick={handleLinkClick}
              >
                Contact
              </Link>

              <div className="border-t pt-4 mt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 px-2 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={user.email || "User"} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium truncate">{user.email}</span>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      className="flex items-center space-x-2 px-2 py-3 rounded-md hover:bg-accent transition-colors"
                      onClick={handleLinkClick}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    
                    {isStaff && (
                      <Link 
                        to="/staff/panel" 
                        className="flex items-center space-x-2 px-2 py-3 rounded-md hover:bg-accent transition-colors"
                        onClick={handleLinkClick}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    )}
                    
                    <ThemeToggle mobile />
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start px-2 py-3 h-auto"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Log out</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      onClick={() => {
                        onAuthModalOpen();
                        setIsOpen(false);
                      }} 
                      variant="outline" 
                      className="w-full"
                    >
                      Sign In
                    </Button>
                    <ThemeToggle mobile />
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MobileNav;
