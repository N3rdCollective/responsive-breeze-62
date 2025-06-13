
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useScrollToTopNavigation } from '@/hooks/useScrollToTopNavigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Mail, User, LogOut, Bell, LogIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedMessages } from '@/hooks/useUnifiedMessages';
import NotificationBell from '@/components/notifications/NotificationBell';
import ThemeToggle from '@/components/navbar/ThemeToggle';
import { Separator } from '@/components/ui/separator';
import ScrollToTopLink from '@/components/ui/scroll-to-top-link';

interface MobileNavProps {
  isScrolled: boolean;
  isHomePage: boolean;
  onAuthModalOpen?: () => void;
}

const MobileNav = ({ isScrolled, isHomePage, onAuthModalOpen }: MobileNavProps) => {
  const location = useLocation();
  const navigate = useScrollToTopNavigation();
  const { user, logout } = useAuth();
  const { totalUnreadCount } = useUnifiedMessages();
  const [open, setOpen] = React.useState(false);

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/news', label: 'News' },
    { href: '/schedule', label: 'Schedule' },
    { href: '/personalities', label: 'Personalities' },
    { href: '/artists', label: 'Artists' },
    { href: '/members', label: 'Forum' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleAuthAction = () => {
    setOpen(false);
    if (onAuthModalOpen) {
      onAuthModalOpen();
    } else {
      navigate('/auth');
    }
  };

  const handleMessagesClick = () => {
    navigate("/messages");
  };

  return (
    <div className="md:hidden flex items-center space-x-2">
      {/* Mobile User Controls - Only for authenticated users */}
      {user && (
        <div className="flex items-center space-x-2">
          <NotificationBell mobile isHomePage={isHomePage} isScrolled={isScrolled} />
          
          {/* Updated to use unified count */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMessagesClick}
            className={`relative h-9 w-9 transition-colors ${
              isHomePage && !isScrolled 
                ? "text-white hover:text-primary hover:bg-white/10" 
                : "text-foreground hover:text-primary hover:bg-accent"
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
        </div>
      )}

      {/* Mobile Menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <nav className="flex flex-col gap-4 mt-6">
            {navItems.map((item) => (
              <ScrollToTopLink
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </ScrollToTopLink>
            ))}
            
            <Separator />
            
            {user ? (
              <>
                <ScrollToTopLink
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </ScrollToTopLink>
                
                <ThemeToggle mobile isHomePage={isHomePage} isScrolled={isScrolled} />
                
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm font-medium transition-colors hover:text-primary text-muted-foreground text-left"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleAuthAction}
                  className="flex items-center text-sm font-medium transition-colors hover:text-primary text-muted-foreground text-left"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In / Sign Up
                </button>
                
                <ThemeToggle mobile isHomePage={isHomePage} isScrolled={isScrolled} />
              </>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileNav;
