
import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import ScrollToTopLink from "@/components/ui/scroll-to-top-link";

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
  badgeCount?: number;
}

const NavItem = ({ path, label, isActive, isHomePage, isScrolled, onClick, className, icon: IconComponent, iconOnly, badgeCount }: NavItemProps) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    // Scroll to top will be handled by ScrollToTopLink
  };

  const baseStyling = isActive
    ? 'text-[#FFD700] dark:text-[#FFD700]'
    : isHomePage && !isScrolled
      ? 'text-white hover:text-[#FFD700]'
      : 'text-[#333333] dark:text-white hover:text-[#FFD700] dark:hover:text-[#FFD700]';
  
  const commonClasses = 'font-medium transition-colors duration-200 flex items-center relative';

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
            iconOnly ? "-right-2 -top-2" : "ml-1"
          )}
          style={{ lineHeight: '1' }}
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
    <ScrollToTopLink
      to={path}
      onClick={handleClick}
      className={cn(baseStyling, commonClasses, className)}
      {...accessibilityProps}
    >
      {content}
    </ScrollToTopLink>
  );
};

export default NavItem;
