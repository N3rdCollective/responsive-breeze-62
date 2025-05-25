import { Link } from "react-router-dom";
import { cn } from "@/lib/utils"; // Import cn
import React from "react"; // Import React for React.ElementType
import { Badge } from "@/components/ui/badge"; // Import Badge

interface NavItemProps {
  path: string;
  label: string;
  isActive: boolean;
  isHomePage: boolean;
  isScrolled: boolean;
  onClick?: () => void;
  className?: string; 
  icon?: React.ElementType; 
  iconOnly?: boolean;
  badgeCount?: number; // Added badgeCount prop
}

const NavItem = ({ path, label, isActive, isHomePage, isScrolled, onClick, className, icon: IconComponent, iconOnly, badgeCount }: NavItemProps) => {
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
  
  const commonClasses = 'font-medium transition-colors duration-200 flex items-center relative'; // Added relative for badge positioning

  const iconElement = IconComponent && <IconComponent className="h-4 w-4" />;
  
  const content = (
    <>
      {iconOnly ? (
        iconElement
      ) : (
        <>
          {IconComponent && <IconComponent className={`h-4 w-4 ${label ? 'mr-1.5' : ''}`} />}
          {label}
        </>
      )}
      {badgeCount && badgeCount > 0 && (
        <Badge
          variant="destructive"
          className={cn(
            "absolute -top-1 -right-1 h-4 w-4 min-w-[1rem] p-0 flex items-center justify-center text-xs rounded-full",
            iconOnly ? "-right-2 -top-2" : "ml-1" // Adjust position for iconOnly or labeled items
          )}
          style={{ lineHeight: '1' }} // Ensure text is centered in small badge
        >
          {badgeCount > 9 ? '9+' : badgeCount}
        </Badge>
      )}
    </>
  );
  

  const accessibilityProps = iconOnly && label ? { 'aria-label': label, title: label } : {};

  if (path.startsWith("#") && onClick) {
    return (
      <button
        onClick={handleClick}
        className={cn(baseStyling, commonClasses, className)}
        {...accessibilityProps}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={path}
      onClick={handleClick}
      className={cn(baseStyling, commonClasses, className)}
      {...accessibilityProps}
    >
      {content}
    </Link>
  );
};

export default NavItem;
