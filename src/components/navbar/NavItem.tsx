
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils"; // Import cn

interface NavItemProps {
  path: string;
  label: string;
  isActive: boolean;
  isHomePage: boolean;
  isScrolled: boolean;
  onClick?: () => void;
  className?: string; // Added className prop
}

const NavItem = ({ path, label, isActive, isHomePage, isScrolled, onClick, className }: NavItemProps) => {
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
  
  const commonClasses = 'font-medium transition-colors duration-200';

  if (path === "#" && onClick) {
    return (
      <button
        onClick={handleClick}
        className={cn(baseStyling, commonClasses, className)} // Use cn to merge classes
      >
        {label}
      </button>
    );
  }

  return (
    <Link
      to={path}
      onClick={handleClick}
      className={cn(baseStyling, commonClasses, className)} // Use cn to merge classes
    >
      {label}
    </Link>
  );
};

export default NavItem;
