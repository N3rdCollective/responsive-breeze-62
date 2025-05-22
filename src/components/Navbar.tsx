
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, LogOut, UserCircle, LayoutDashboard, Settings, Radio, CalendarDays, ShoppingCart, Newspaper, Mic2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Assuming Logo component might be themed, if it exists. For now, using text.
// import Logo from '@/components/Logo'; 

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Re-adding nav links assuming their pages exist or will be styled
  const navLinks: { href: string, label: string, icon: React.ElementType }[] = [
    { href: '/radio', label: 'Radio', icon: Radio },
    { href: '/events', label: 'Events', icon: CalendarDays },
    { href: '/store', label: 'Store', icon: ShoppingCart },
    { href: '/news', label: 'News', icon: Newspaper },
    { href: '/submit-song', label: 'Submit Song', icon: Mic2 },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      navigate('/'); 
    }
  };

  const UserAvatar = () => {
    if (loading) return <div className="h-10 w-10 rounded-full bg-hot97-purple animate-pulse"></div>;
    if (!user) return null;

    const profile = user.user_metadata;
    const avatarUrl = profile?.avatar_url || profile?.profile_picture;
    const displayName = profile?.display_name || profile?.full_name || profile?.user_name || user.email?.split('@')[0];
    const fallbackInitial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-hot97-magenta/20">
            {avatarUrl ? (
              <img src={avatarUrl} alt="User avatar" className="h-full w-full rounded-full object-cover" />
            ) : (
              <div className="h-full w-full rounded-full bg-hot97-purple flex items-center justify-center text-hot97-white text-lg font-semibold">
                {fallbackInitial}
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-hot97-dark-purple border-hot97-magenta text-hot97-white" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-hot97-light-pink">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-hot97-magenta/50" />
          <DropdownMenuItem onClick={() => navigate('/dashboard')} className="hover:bg-hot97-magenta/30 focus:bg-hot97-magenta/40">
            <LayoutDashboard className="mr-2 h-4 w-4 text-hot97-pink" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/profile/me')} className="hover:bg-hot97-magenta/30 focus:bg-hot97-magenta/40">
            <UserCircle className="mr-2 h-4 w-4 text-hot97-pink" />
            <span>My Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')} className="hover:bg-hot97-magenta/30 focus:bg-hot97-magenta/40">
            <Settings className="mr-2 h-4 w-4 text-hot97-pink" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-hot97-magenta/50" />
          <DropdownMenuItem onClick={handleLogout} className="hover:bg-hot97-magenta/30 focus:bg-hot97-magenta/40">
            <LogOut className="mr-2 h-4 w-4 text-hot97-pink" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  const renderNavLinks = (isMobile: boolean) => (
    navLinks.map((link) => (
      <Link
        key={link.label}
        to={link.href}
        onClick={() => isMobile && setIsOpen(false)}
        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isMobile 
            ? 'text-hot97-white hover:bg-hot97-magenta/80 w-full text-left' 
            : 'text-hot97-white hover:text-hot97-pink' // Desktop links in Navbar
        }`}
      >
        <link.icon className={`mr-2 h-5 w-5 ${isMobile ? 'text-hot97-pink' : 'text-hot97-pink'}`} />
        {link.label}
      </Link>
    ))
  );

  return (
    <nav className="hot97-dark-bg backdrop-blur-md shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="font-bold text-xl hot97-text-gradient">HOT 97</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-2">
              {renderNavLinks(false)}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {user ? (
              <UserAvatar />
            ) : (
              !loading && (
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="hidden md:inline-flex bg-hot97-pink hover:bg-hot97-magenta text-hot97-white"
                >
                  Login / Sign Up
                </Button>
              )
            )}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu" className="text-hot97-white hover:bg-hot97-magenta/50">
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px] pt-10 bg-hot97-dark-purple border-l-hot97-magenta text-hot97-white">
                  <div className="flex flex-col space-y-3">
                    {renderNavLinks(true)}
                    {!user && !loading && (
                       <Button 
                         onClick={() => { navigate('/auth'); setIsOpen(false); }} 
                         className="w-full bg-hot97-pink hover:bg-hot97-magenta text-hot97-white"
                       >
                         Login / Sign Up
                       </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
