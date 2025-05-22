import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, LogOut, UserCircle, LayoutDashboard, Settings } from 'lucide-react'; // Removed icons for missing navLinks
import { useAuth } from '@/hooks/useAuth';
// Removed: import { useTheme } from '@/components/theme-provider'; // This was causing an error
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Removed: import Logo from '@/components/Logo'; // This was causing an error

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  // Removed theme state and setTheme function from the missing useTheme hook
  // const { theme, setTheme } = useTheme(); // From missing theme-provider

  // Nav links are emptied because target pages are missing
  const navLinks: { href: string, label: string, icon: React.ElementType }[] = [
    // { href: '/radio', label: 'Radio', icon: Radio },
    // { href: '/events', label: 'Events', icon: CalendarDays },
    // { href: '/store', label: 'Store', icon: ShoppingCart },
    // { href: '/news', label: 'News', icon: Newspaper },
    // { href: '/submit-song', label: 'Submit Song', icon: Mic2 },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      navigate('/'); // Redirect to homepage after logout
    }
  };

  // Removed useEffect for theme handling as useTheme is missing
  // useEffect(() => {
  //   const htmlElement = document.documentElement;
  //   if (theme === 'dark') {
  //     htmlElement.classList.add('dark');
  //   } else {
  //     htmlElement.classList.remove('dark');
  //   }
  // }, [theme]);

  // Removed toggleTheme function as useTheme is missing
  // const toggleTheme = () => {
  //   setTheme(theme === 'light' ? 'dark' : 'light');
  // };

  const UserAvatar = () => {
    if (loading) return <div className="h-8 w-8 rounded-full bg-gray-300 animate-pulse"></div>;
    if (!user) return null;

    const profile = user.user_metadata;
    const avatarUrl = profile?.avatar_url || profile?.profile_picture;
    const displayName = profile?.display_name || profile?.full_name || profile?.user_name || user.email?.split('@')[0];
    const fallbackInitial = displayName ? displayName.charAt(0).toUpperCase() : 'U';

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            {avatarUrl ? (
              <img src={avatarUrl} alt="User avatar" className="h-full w-full rounded-full object-cover" />
            ) : (
              <div className="h-full w-full rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-semibold">
                {fallbackInitial}
              </div>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate('/dashboard')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/profile/me')}>
            <UserCircle className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
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
            ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left' 
            : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
        }`}
      >
        <link.icon className={`mr-2 h-5 w-5 ${isMobile ? '' : 'hidden md:inline-flex'}`} />
        {link.label}
      </Link>
    ))
  );

  return (
    <nav className="bg-background/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              {/* <Logo className="h-8 w-auto" /> Replaced with text */}
              <span className="font-bold text-xl text-primary">Site Name</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-2">
              {renderNavLinks(false)}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {/* Removed theme toggle button as useTheme and toggleTheme are missing */}
            {/* <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button> */}
            {user ? (
              <UserAvatar />
            ) : (
              !loading && (
                <Button onClick={() => navigate('/auth')} className="hidden md:inline-flex">
                  Login / Sign Up
                </Button>
              )
            )}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px] pt-10">
                  <div className="flex flex-col space-y-3">
                    {renderNavLinks(true)}
                    {!user && !loading && (
                       <Button onClick={() => { navigate('/auth'); setIsOpen(false); }} className="w-full">
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
