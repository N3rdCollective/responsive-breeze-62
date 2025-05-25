
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils"; // Import cn
import React from "react"; // Import React for React.ElementType

interface NavItemProps {
  path: string;
  label: string;
  isActive: boolean;
  isHomePage: boolean;
  isScrolled: boolean;
  onClick?: () => void;
  className?: string; // Added className prop
  icon?: React.ElementType; // Added icon prop
}

const NavItem = ({ path, label, isActive, isHomePage, isScrolled, onClick, className, icon: IconComponent }: NavItemProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.scrollTo(0, 0);
    }
  };

  const baseStyling = isActive
    ? 'text-[#FFD700] dark:text-[#FFD700]'
    : isHomePage && !isScrolled
      ? 'text-white hover:text-[#FFD700]'
      : 'text-[#333333] dark:text-white hover:text-[#FFD700] dark:hover:text-[#FFD700]';
  
  const commonClasses = 'font-medium transition-colors duration-200 flex items-center'; // Added flex items-center

  const content = (
    <>
      {IconComponent && <IconComponent className="h-4 w-4 mr-1.5" />}
      {label}
    </>
  );

  if (path.startsWith("#") && onClick) { // Check if path starts with # for buttons
    return (
      <button
        onClick={handleClick}
        className={cn(baseStyling, commonClasses, className)} // Use cn to merge classes
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={path}
      onClick={handleClick}
      className={cn(baseStyling, commonClasses, className)} // Use cn to merge classes
    >
      {content}
    </Link>
  );
};

export default NavItem;
