
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavItem from './NavItem';
import { useAuth } from '@/hooks/useAuth';

interface DesktopNavProps {
  isScrolled: boolean;
}

const DesktopNav = ({ isScrolled }: DesktopNavProps) => {
  const location = useLocation();
  const { user } = useAuth();

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

  const isHomePage = location.pathname === "/";

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
