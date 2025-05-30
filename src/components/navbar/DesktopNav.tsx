
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavItem from './NavItem';
import { useAuth } from '@/hooks/useAuth';

const DesktopNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/news', label: 'News' },
    { href: '/schedule', label: 'Schedule' },
    { href: '/personalities', label: 'Personalities' },
    { href: '/artists', label: 'Artists' },
    { href: '/forum/categories/general', label: 'Forum' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  // Add Messages link for authenticated users
  if (user) {
    const messagesIndex = navItems.findIndex(item => item.href === '/contact');
    navItems.splice(messagesIndex, 0, { href: '/messages', label: 'Messages' });
  }

  const isHomePage = location.pathname === "/";
  const isScrolled = false; // This would come from parent component normally

  return (
    <nav className="hidden md:flex items-center space-x-8">
      {navItems.map((item) => (
        <NavItem 
          key={item.href} 
          path={item.href} 
          label={item.label}
          isActive={location.pathname === item.href}
          isHomePage={isHomePage}
          isScrolled={isScrolled}
        />
      ))}
    </nav>
  );
};

export default DesktopNav;
